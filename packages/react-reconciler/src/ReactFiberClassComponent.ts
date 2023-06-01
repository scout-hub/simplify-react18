/*
 * @Author: Zhouqi
 * @Date: 2022-06-18 21:00:04
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-04-16 14:03:45
 */
import { NoLanes } from "./ReactFiberLane";
import { assign, isFunction, shallowEqual } from "shared";
import { Fiber } from "./ReactInternalTypes";
import {
  cloneUpdateQueue,
  createUpdate,
  enqueueUpdate,
  initializeUpdateQueue,
  processUpdateQueue,
  ReplaceState,
  UpdateQueue,
} from "./ReactUpdateQueue";
import type { Lanes } from "./ReactFiberLane";
import { Snapshot, Update } from "./ReactFiberFlags";
import {
  get as getInstance,
  set as setInstance,
} from "shared";
import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber,
} from "./ReactFiberWorkLoop";

const classComponentUpdater = {
  enqueueSetState(instance, payload, callback) {
    // 根据实例获取对应的fiber
    const fiber = getInstance(instance);
    const eventTime = requestEventTime();
    const lane = requestUpdateLane(fiber);
    // 创建一个update
    const update = createUpdate(eventTime, lane);
    // 赋值参数
    update.payload = payload;
    // 绑定callback
    if (callback != null) {
      update.callback = callback;
    }
    // update入队
    enqueueUpdate(fiber, update);
    // 开始调度更新
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  },
  enqueueReplaceState(instance, payload, callback) {
    const fiber = getInstance(instance);
    const lane = requestUpdateLane(fiber);
    const eventTime = requestEventTime();

    const update = createUpdate(eventTime, lane);
    update.payload = payload;
    // 标记替换为ReplaceState
    update.tag = ReplaceState;

    if (callback != null) {
      update.callback = callback;
    }

    enqueueUpdate(fiber, update);
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  },
};

/**
 * @description: 收集组件实例
 */
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  instance.updater = classComponentUpdater;
  workInProgress.stateNode = instance;
  // 在实例上绑定当前class组件的fiber，在需要调度的时候可以获取这个fiber
  setInstance(instance, workInProgress);
}

/**
 * @description: 检查组件是否需要更新，pureComponent浅比较以及shouldComponentUpdate生命周期函数
 */
function checkShouldComponentUpdate(
  workInProgress: Fiber,
  ctor: any,
  oldProps: any,
  newProps: any,
  oldState: any,
  newState: any
) {
  const instance = workInProgress.stateNode;
  const shouldComponentUpdate = instance.shouldComponentUpdate;
  // 调用shouldComponentUpdate生命周期函数
  if (isFunction(shouldComponentUpdate)) {
    const shouldUpdate = shouldComponentUpdate(newProps, newState);
    return shouldUpdate;
  }

  // pureComponent的浅比较
  const pureComponentPrototype = ctor.prototype;
  if (pureComponentPrototype && pureComponentPrototype.isPureReactComponent) {
    return (
      !shallowEqual(oldState, newState) || !shallowEqual(oldProps, newProps)
    );
  }

  return true;
}

function applyDerivedStateFromProps(
  workInProgress: Fiber,
  ctor: any,
  getDerivedStateFromProps: (props: any, state: any) => any,
  nextProps: any
) {
  const prevState = workInProgress.memoizedState;
  // 执行getDerivedStateFromProps函数获取新的state
  const partialState = getDerivedStateFromProps(nextProps, prevState);
  // 如果partialState是null或者undefined，则不更新当前的state，否则合并新旧state
  const memoizedState =
    partialState == null ? prevState : assign({}, prevState, partialState);
  workInProgress.memoizedState = memoizedState;
  // 如果当前没有任务需要更新，则直接将state作为基状态
  // TODD 在beginWork阶段，会把workInProgress.lanes赋值为noLanes，下面这个判断一直是true？？？？
  if (workInProgress.lanes === NoLanes) {
    const updateQueue: UpdateQueue<any> = workInProgress.updateQueue;
    updateQueue.baseState = memoizedState;
  }
}

function callComponentWillMount(workInProgress: Fiber, instance: any) {
  const oldState = instance.state;
  instance.componentWillMount();

  /**
   * 在componentWillMount可能会直接修改state，即this.state = xxx，实际上应该用setState
   * 但是react也会帮你进行state的替换
   */
  if (oldState !== instance.state) {
    instance.updater.enqueueReplaceState(instance, instance.state, null);
  }
}

function callComponentWillReceiveProps(workInProgress, instance, newProps) {
  const oldState = instance.state;
  instance.componentWillReceiveProps(newProps);

  // callComponentWillReceiveProps可能会同步修改state，即this.state = xxx，实际上应该用setState
  if (instance.state !== oldState) {
    instance.updater.enqueueReplaceState(instance, instance.state, null);
  }
}

/**
 * @description: 生成class组件实例
 */
export function constructClassInstance(
  workInProgress: Fiber,
  ctor: any,
  props: any
) {
  let instance = new ctor(props);
  // 获取组件实例上定义的state
  const state = instance.state;
  workInProgress.memoizedState = state == null ? null : state;
  adoptClassInstance(workInProgress, instance);
  return instance;
}

/**
 * @description: 挂载class组件实例
 */
export function mountClassInstance(
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderLanes: Lanes
) {
  const instance = workInProgress.stateNode;
  instance.props = newProps;
  instance.state = workInProgress.memoizedState;
  // 初始化更新队列
  initializeUpdateQueue(workInProgress);
  // class（不是实例上获取）上获取getDerivedStateFromProps生命周期函数
  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;

  if (isFunction(getDerivedStateFromProps)) {
    // 执行getDerivedStateFromProps生命周期函数，这个函数是在finishClassComponent（render）之前执行的
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps
    );
    // 更新instance上的state
    instance.state = workInProgress.memoizedState;
  }

  // 判断是否有新的生命周期函数getDerivedStateFromProps、getSnapshotBeforeUpdate
  const hasNewLifecycles =
    isFunction(getDerivedStateFromProps) ||
    isFunction(instance.getSnapshotBeforeUpdate);

  if (!hasNewLifecycles && isFunction(instance.componentWillMount)) {
    callComponentWillMount(workInProgress, instance);
    // componentWillMount可能存在额外的状态更新，这里去处理这些状态更新
    processUpdateQueue(workInProgress, newProps, instance, renderLanes);
    // 更新一下实例上的state
    instance.state = workInProgress.memoizedState;
  }

  // 如果componentDidMount存在，标记上Update
  if (isFunction(instance.componentDidMount)) {
    workInProgress.flags |= Update;
  }
}

/**
 * @description: 更新class组件实例
 */
export function updateClassInstance(
  current: Fiber,
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderLanes: Lanes
): boolean {
  const instance = workInProgress.stateNode;
  cloneUpdateQueue(current, workInProgress);
  const oldProps = workInProgress.memoizedProps;
  instance.props = oldProps;

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;

  // 判断是否有新的生命周期函数getDerivedStateFromProps、getSnapshotBeforeUpdate
  const hasNewLifecycles =
    isFunction(getDerivedStateFromProps) ||
    isFunction(instance.getSnapshotBeforeUpdate);

  // 在下面这些生命周期中，只有在componentDidUpdate中的实例上的props和state才是新的，其他都是老的

  // 当用了新的生命周期函数时，不应该再调用不安全的生命周期函数
  if (!hasNewLifecycles && isFunction(instance.componentWillReceiveProps)) {
    if (oldProps !== newProps) {
      callComponentWillReceiveProps(workInProgress, instance, newProps);
    }
  }

  const oldState = workInProgress.memoizedState;
  let newState = (instance.state = oldState);
  processUpdateQueue(workInProgress, newProps, instance, renderLanes);
  // 获取结果processUpdateQueue处理后的新的memoizedState
  newState = workInProgress.memoizedState;
  if (oldProps === newProps && oldState === newState) {
    throw Error("oldProps === newProps && oldState === newState");
  }

  if (isFunction(getDerivedStateFromProps)) {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps
    );
    newState = workInProgress.memoizedState;
  }

  // 是否需要更新
  const shouldUpdate = checkShouldComponentUpdate(
    workInProgress,
    ctor,
    oldProps,
    newProps,
    oldState,
    newState
  );

  // 需要更新组件
  if (shouldUpdate) {
    if (!hasNewLifecycles && isFunction(instance.componentWillUpdate)) {
      instance.componentWillUpdate(newProps, newState);
    }
    if (isFunction(instance.componentDidUpdate)) {
      workInProgress.flags |= Update;
    }
    if (isFunction(instance.getSnapshotBeforeUpdate)) {
      workInProgress.flags |= Snapshot;
    }
  } else {
    // componentDidUpdate存在的并且新旧props或state不相等的情况下，标记上Update flag
    if (isFunction(instance.componentDidUpdate)) {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.flags |= Update;
      }
    }

    // getSnapshotBeforeUpdate存在的并且新旧props或state不相等的情况下，标记上Snapshot flag
    if (isFunction(instance.getSnapshotBeforeUpdate)) {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.flags |= Snapshot;
      }
    }

    // 即使shouldUpdate是false，这里也要更新memoizedProps和memoizedState，表示可以复用
    workInProgress.memoizedProps = newProps;
    workInProgress.memoizedState = newState;
  }

  // 更新实例上的状态
  instance.props = newProps;
  instance.state = newState;

  return shouldUpdate;
}

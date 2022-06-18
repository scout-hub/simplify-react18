/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 14:45:26
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-18 15:51:31
 */
import { Lane, Lanes, NoLanes } from "./ReactFiberLane";
import { is, isFunction } from "packages/shared/src";
import ReactSharedInternals from "packages/shared/src/ReactSharedInternals";
import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber,
} from "./ReactFiberWorkLoop";
import type {
  BasicStateAction,
  Dispatch,
  Dispatcher,
  Fiber,
} from "./ReactInternalTypes";
import { markWorkInProgressReceivedUpdate } from "./ReactFiberBeginWork";

type Update<S> = {
  lane: Lane;
  action: S;
  eagerState: S | null;
  hasEagerState: boolean;
  next: Update<S>;
};

export type Hook = {
  memoizedState: any; // hook对应的state属性
  baseState: any;
  baseQueue: Update<any> | null;
  queue: any; // hook保存的Update更新链表
  next: Hook | null; // 指向下一个hook
};

export type UpdateQueue<S, A> = {
  pending: Update<S> | null;
  dispatch: Dispatch<BasicStateAction<S>> | null;
  lastRenderedReducer: (S, A) => S;
  lastRenderedState: S | null;
};

const { ReactCurrentDispatcher } = ReactSharedInternals;

let workInProgressHook: Hook | null = null;
// 当前正在内存中渲染的fiber
let currentlyRenderingFiber: Fiber | null = null;
let renderLanes: Lanes = NoLanes;
let currentHook: Hook | null = null;

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

const HooksDispatcherOnUpdate = {
  useState: updateState,
};

/**
 * @description: 渲染hook函数组件
 */
export function renderWithHooks(
  current: Fiber | null,
  workInProgress,
  Component: Function,
  props: any,
  secondArg: any,
  nextRenderLanes: Lanes
) {
  renderLanes = nextRenderLanes;
  // 赋值currentlyRenderingFiber为当前的workInProgress
  currentlyRenderingFiber = workInProgress;
  // 重置memoizedState和updateQueue
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = NoLanes;

  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate;

  const children = Component();
  // console.log(children);
  currentlyRenderingFiber = null;
  renderLanes = NoLanes;
  currentHook = null;
  workInProgressHook = null;
  return children;
}

/**
 * @description: 清除一个fiber节点上的副作用标记。当一节点出现在render流程中，并且lanes不为空，
 * 但是节点不需要工作，会调用该函数清除副作用并结束更新流程。
 * 比如setState同一个值
 */
export function bailoutHooks(
  current: Fiber,
  workInProgress: Fiber,
  lanes: Lanes
) {
  // TODO
}

function basicStateReducer<S>(state: S, action: BasicStateAction<S>) {
  return isFunction(action) ? (action as (S) => S)(state) : action;
}

/**
 * @description: mount阶段的useState函数
 */
function mountState<S, A>(
  initialState: S | (() => S)
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  if (isFunction(initialState)) {
    initialState = (initialState as () => S)();
  }
  // 首次使用hook时，hook.memoizedState就是initialState
  hook.memoizedState = hook.baseState = initialState;
  const queue: UpdateQueue<S, A> = {
    pending: null, // 指向末尾的Update
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState as any,
  };
  // hook上的queue和Update上的queue一样，是一个环状链表
  hook.queue = queue;
  const dispatch: Dispatch<BasicStateAction<S>> = (queue.dispatch =
    dispatchSetState.bind(null, currentlyRenderingFiber!, queue));

  return [hook.memoizedState, dispatch];
}

/**
 * @description: update阶段的useState函数
 */
function updateState<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, initialState);
}

function updateReducer<S>(
  reducer,
  initialArg
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  if (queue === null) throw Error("queue is null");

  queue.lastRenderedReducer = reducer;
  const current = currentHook!;
  // baseQueue指向链表的最后一位
  let baseQueue = current.baseQueue;
  // pending指向链表的最后一位
  const pendingQueue = queue.pending;

  // 最后挂起的Update还没处理，把它加到baseQueue上
  if (pendingQueue !== null) {
    if (baseQueue != null) {
      // 合并baseQueue和pendingQueue
      // 1、假设baseQueue为 1->2->1  baseQueue.next是1
      const baseFirst = baseQueue.next;
      // 2、假设pendingQueue为 3->4->3 pendingQueue.next是3
      const pendingFirst = pendingQueue.next;
      // 3、2->3   ===>  1->2->3->4
      baseQueue.next = pendingFirst;
      // 4、4->1   ===>  1->2->3->4->1
      pendingQueue.next = baseFirst;
    }

    // baseQueue为 1->2->3->4->1
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }

  // 存在baseQueue需要处理
  if (baseQueue !== null) {
    // 获取第一个Update
    const first = baseQueue.next;
    let newState = current.baseState;

    let newBaseState = null;
    // let newBaseQueueFirst = null;
    // let newBaseQueueLast = null;
    let update = first;

    // 循环处理所有Update，进行state的计算
    // 循环终止条件：update不存在或者且update !== first（只有一个Update的情况）
    do {
      // TODO 优先级不足，跳过这个更新，如果这是第一次跳过，则上一次的更新状态是这次的基状态
      // 这次更新有足够的优先级
      // if (newBaseQueueLast !== null) {
      //   // TODO
      // }
      // 使用之前已经计算好的state
      if (update.hasEagerState) {
        newState = update.eagerState;
      } else {
        const action = update.action;
        // 计算新的state
        newState = reducer(newState, action);
      }
      update = update.next;
    } while (update !== null && update !== first);

    newBaseState = newState;

    // 新旧state是否相同，如果不同，标记receivedUpdate为true
    if (!is(newState, hook.memoizedState)) {
      markWorkInProgressReceivedUpdate();
    }

    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    queue.lastRenderedState = newState;
  }

  const dispatch: Dispatch<BasicStateAction<S>> = queue.dispatch;
  return [hook.memoizedState, dispatch];
}

/**
 * @description: 从current hook中复制得到workInProgressHook
 */
function updateWorkInProgressHook(): Hook {
  // 下一个hook
  let nextCurrentHook: null | Hook;
  // currentHook不存在
  if (currentHook === null) {
    // 获取current Fiber
    const current = currentlyRenderingFiber?.alternate;
    if (current != null) {
      // current存在则获取hook数据
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    // currentHook存在则通过next获取下一个hook
    nextCurrentHook = currentHook.next;
  }

  let nextWorkInProgressHook: null | Hook;
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber?.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  if (nextWorkInProgressHook !== null) {
    // 存在workInProgressHook，直接复用
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;
    currentHook = nextCurrentHook;
  } else {
    if (nextCurrentHook === null) throw Error("nextCurrentHook is null");
    currentHook = nextCurrentHook;
    const { memoizedState, baseState, baseQueue, queue } = currentHook;
    // 从current hook复制一份
    const newHook: Hook = {
      memoizedState,
      baseState,
      baseQueue,
      queue,
      next: null,
    };
    if (workInProgressHook === null) {
      // 这是第一个hook
      currentlyRenderingFiber!.memoizedState = workInProgressHook = newHook;
    } else {
      // 添加到hook链表的最后
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }

  return workInProgressHook!;
}

/**
 * @description: 生成workInProgressHook
 */
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  // workInProgressHook是一个链表，通过next去添加下一个hook
  if (workInProgressHook == null) {
    // hook只能在function component中使用，而function component函数会在renderWithHooks中调用，
    // 在调用之前，currentlyRenderingFiber会被赋值为当前function component所对应的workInProgress
    currentlyRenderingFiber!.memoizedState = hook;
  } else {
    // 第二次使用hook时，将当前hook添加到workInProgressHook的末尾
    workInProgressHook!.next = hook;
  }
  // 设置workInProgressHook为当前hook
  workInProgressHook = hook;
  return workInProgressHook!;
}

/**
 * @description: 更新hook上的state
 */
function dispatchSetState<S>(fiber: Fiber, queue: any, action: S) {
  // 计算事件的优先级
  const lane = requestUpdateLane(fiber);
  // 创建一个update
  const update: Update<S> = {
    lane,
    action,
    eagerState: null,
    hasEagerState: false,
    next: null as any, // 指向下一个update，用于构建环状链表
  };
  // 判断是否是render阶段产生的更新，即直接在执行function component函数时调用了dispatchSetState
  if (fiber === currentlyRenderingFiber) {
    throw Error("dispatchSetState while function component is rendering");
  } else {
    enqueueUpdate(fiber, queue, update);
    const alternate = fiber.alternate;
    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      // 当前队列是空的，意味着在渲染之前我们可以立马计算出下一个state，如果新旧state是一样的就可以提早bail out
      const lastRenderedReducer = queue.lastRenderedReducer;
      if (lastRenderedReducer !== null) {
        // 获取上一次渲染阶段时的state
        const currentState = queue.lastRenderedState;
        // 获取期望的state，也就是通过调用useState返回的dispatch函数，将新的state计算方式传入并调用的结果
        const eagerState = lastRenderedReducer(currentState, action);
        // 缓存新的计算结果
        update.hasEagerState = true;
        update.eagerState = eagerState;
        // 新旧state是一样的就可以提早bail out
        if (is(eagerState, currentState)) {
          return;
        }
      }
    }
    const eventTime = requestEventTime();
    // 调度fiber节点的更新
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  }
}

/**
 * @description: 构建update环状链表
 */
function enqueueUpdate<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  update: Update<S>
) {
  const pending = queue.pending;
  // 第一个update，自身和自身构成环状链表
  if (pending === null) {
    update.next = update;
  } else {
    // 已经存在环状链表了，需要加当前update插入到环状链表的末尾
    // 比如 1->2->3->1 添加了一个4 就变成 1->2->3->4->1
    // 1、将当前update的next指向第一个update，第一个update就是pending.next ===> 4->1->2->3
    update.next = pending.next;
    // 2、当前环状链表末尾的update指向新创建的update  ===》 4->1->2->3->4
    pending.next = update;
  }
  // 新创建的update为当前环状链表的末尾
  queue.pending = update;
}

/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 14:45:26
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-16 12:00:27
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

type Update<S> = {
  lane: Lane;
  action: S;
  eagerState: S | null;
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
  return children;
}

function basicStateReducer<S>(state: S, action: BasicStateAction<S>) {
  return isFunction(action) ? (action as () => S)() : action;
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
  const dispatch: Dispatch<BasicStateAction<S>> = queue.dispatch;
  return [hook.memoizedState, dispatch];
}

function updateWorkInProgressHook(): Hook {
  // 下一个hook
  let nextCurrentHook: null | Hook;
  if (currentHook === null) {
    const current = currentlyRenderingFiber?.alternate;
    if (current != null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  console.log(nextCurrentHook);

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
    next: null as any, // 指向下一个update，用于构建环状链表
  };
  // 判断是否是render阶段产生的更新，即直接在执行function component函数时调用了dispatchSetState
  if (fiber === currentlyRenderingFiber) {
    // TODO
  } else {
    enqueueUpdate(fiber, queue, update);
    const lastRenderedReducer = queue.lastRenderedReducer;
    if (lastRenderedReducer !== null) {
      // 获取上一次渲染阶段时的state
      const currentState = queue.lastRenderedState;
      // 获取期望的state，也就是通过调用useState返回的dispatch函数，将新的state计算方式传入并调用的结果
      const eagerState = lastRenderedReducer(currentState, action);
      // 如果期望的state和上一次渲染阶段的state一致，则不需要触发更新逻辑
      if (is(eagerState, currentState)) {
        return;
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

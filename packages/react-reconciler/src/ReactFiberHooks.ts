/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 14:45:26
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-12 22:27:48
 */
import { isFunction } from "packages/shared/src";
import ReactSharedInternals from "packages/shared/src/ReactSharedInternals";
import type {
  BasicStateAction,
  Dispatch,
  Dispatcher,
  Fiber,
} from "./ReactInternalTypes";
import type { Update } from "./ReactUpdateQueue";

export type Hook = {
  memoizedState: any; // hook对应的state属性
  baseState: any;
  baseQueue: Update | null;
  queue: any; // hook保存的Update更新链表
  next: Hook | null; // 指向下一个hook
};

export type UpdateQueue<S> = {
  pending: Update | null;
  dispatch: Dispatch<BasicStateAction<S>> | null;
};

const { ReactCurrentDispatcher } = ReactSharedInternals;

let workInProgressHook: Hook | null = null;
let currentlyRenderingFiber: Fiber | null = null;

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

const HooksDispatcherOnUpdate = {
  useState: mountState,
};

export function renderWithHooks(current, workInProgress, Component) {
  // 赋值currentlyRenderingFiber为当前的workInProgress
  currentlyRenderingFiber = workInProgress;
  // 重置memoizedState和updateQueue
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate;

  const children = Component();
  // console.log(children);
  return children;
}

function mountState<S>(
  initialState: S | (() => S)
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  if (isFunction(initialState)) {
    initialState = (initialState as () => S)();
  }
  // 首次使用hook时，hook.memoizedState就是initialState
  hook.memoizedState = hook.baseState = initialState;
  const queue: UpdateQueue<S> = {
    pending: null,
    dispatch: null,
  };
  // hook上的queue和Update上的queue一样，是一个环状链表
  hook.queue = queue;
  const dispatch: Dispatch<BasicStateAction<S>> = (queue.dispatch =
    dispatchSetState.bind(null, currentlyRenderingFiber, queue));

  return [hook.memoizedState, dispatch];
}

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
function dispatchSetState<S>(fiber: Fiber | null, queue: any, action: S) {
  console.log(fiber);
  console.log(queue);
  console.log(action);
}

/*
 * @Author: Zhouqi
 * @Date: 2022-05-25 21:10:35
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-23 09:04:02
 */
import type { Fiber } from "./ReactInternalTypes";
import { includesSomeLane, Lanes, NoLanes } from "./ReactFiberLane";
import { shouldSetTextContent } from "packages/react-dom/src/client/ReactDOMHostConfig";
import {
  cloneChildFibers,
  mountChildFibers,
  reconcileChildFibers,
} from "./ReactChildFiber";
import { bailoutHooks, renderWithHooks } from "./ReactFiberHooks";
import { cloneUpdateQueue, processUpdateQueue } from "./ReactUpdateQueue";
import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from "./ReactWorkTags";
import { constructClassInstance } from "./ReactFiberClassComponent";

// 是否有更新
let didReceiveUpdate: boolean = false;

export function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  // 首屏渲染只有hostRoot存在current节点，其他节点还未被创建
  // hostRoot的workInPgress树中的HostRoot是在prepareFreshStack函数中创建
  if (current !== null) {
    // update阶段，可以复用current（即旧的fiber节点）
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if (oldProps !== newProps) {
      // 属性更新，标记didReceiveUpdate为true，说明这个fiber需要继续beginWork的其它工作
      didReceiveUpdate = true;
    } else {
      const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
        current,
        renderLanes
      );
      if (!hasScheduledUpdateOrContext) {
        // 说明该fiber不需要进行接下去beginWork的其它工作，转而去看看子节点是否要处理
        didReceiveUpdate = false;
        return attemptEarlyBailoutIfNoScheduledUpdate(
          current,
          workInProgress,
          renderLanes
        );
      }
      didReceiveUpdate = false;
    }
  } else {
    // mount阶段
    didReceiveUpdate = false;
  }
  /**
   * 先清除workInProgress中的lanes
   * 不清除会导致root上的pendingLanes一直不为空，会被一直调度
   */
  workInProgress.lanes = NoLanes;
  switch (workInProgress.tag) {
    case HostRoot: {
      return updateHostRoot(current, workInProgress, renderLanes);
    }
    case IndeterminateComponent:
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes
      );
    case ClassComponent: {
      const Component = workInProgress.type;
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        null,
        renderLanes
      );
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return null;
    // return updateHostText(current, workInProgress);
    case FunctionComponent:
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      // TODO workInProgress.elementType === Component?
      const resolvedProps = unresolvedProps;
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      );
    case Fragment:
      return updateFragment(current, workInProgress, renderLanes);
  }
  return null;
}

/**
 * @description: 更新片段
 */
function updateFragment(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  const nextChildren = workInProgress.pendingProps;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

/**
 * @description: 标记didReceiveUpdate为true
 */
export function markWorkInProgressReceivedUpdate() {
  didReceiveUpdate = true;
}

/**
 * @description: 更新class组件
 */
function updateClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  renderLanes: Lanes
) {
  const instance = workInProgress.stateNode;
  // 首次mount
  if (instance === null) {
    constructClassInstance(workInProgress, Component, nextProps);
  } else {
    // update
  }
  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    true,
    false,
    renderLanes
  );
  return nextUnitOfWork;
}

function finishClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  shouldUpdate: boolean,
  hasContext: boolean,
  renderLanes: Lanes
) {
  const instance = workInProgress.stateNode;
  const nextChildren = instance.render();
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

/**
 * @description: 更新FunctionComponent
 */
function updateFunctionComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: Function,
  nextProps: any,
  renderLanes: number
) {
  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
    null,
    renderLanes
  );

  // 不需要更新，直接bailoutHooks
  if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

function checkScheduledUpdateOrContext(
  current: Fiber,
  renderLanes: Lanes
): boolean {
  // 在执行bailout之前判断该fiber是否需要执行的任务，如果有就不能进行bailoutOnAlreadyFinishedWork
  const updateLanes = current.lanes;
  if (includesSomeLane(updateLanes, renderLanes)) {
    return true;
  }
  return false;
}

function attemptEarlyBailoutIfNoScheduledUpdate(
  current: Fiber,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  switch (workInProgress.tag) {
    case HostRoot:
      break;
    default:
      break;
  }
  return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
}

function bailoutOnAlreadyFinishedWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  // 判断子fiber是否有任务需要进行，如果也没有，则直接返回
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)) return null;
  // 当前这个fiber不需要工作了，但是它的子fiber还需要工作，这里克隆一份子fiber
  cloneChildFibers(current, workInProgress);
  return workInProgress.child;
}

/**
 * @description: 更新当前应用的根节点
 */
function updateHostRoot(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState.element;

  // 克隆一份UpdateQueue
  cloneUpdateQueue(current!, workInProgress);
  processUpdateQueue(workInProgress);

  const nextState = workInProgress.memoizedState;
  // 获取要更新的jsx元素
  const nextChildren = nextState.element;

  // 新旧jsx对象没变，直接返回
  if (nextChildren === prevChildren) {
    return null;
  }

  // 创建子fiber节点
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);

  // 返回子fiber节点
  return workInProgress.child;
}

/**
 * @description: 处理子fiber节点
 */
function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) {
  // current为null说明是首次创建阶段，除了hostRoot节点
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes
    );
  } else {
    // 说明是更新节点，hostRoot节点首次渲染也会进入这里
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes
    );
  }
}

/**
 * @description: Function组件渲染会进入这里
 */
function mountIndeterminateComponent(
  _current: Fiber | null,
  workInProgress: Fiber,
  Component: Function,
  renderLanes: Lanes
) {
  const props = workInProgress.pendingProps;
  // value值是jsx经过babel处理后得到的vnode对象
  const value = renderWithHooks(
    _current,
    workInProgress,
    Component,
    props,
    null,
    renderLanes
  );
  workInProgress.tag = FunctionComponent;
  reconcileChildren(null, workInProgress, value, renderLanes);
  return workInProgress.child;
}

/**
 * @description: 更新普通元素
 */
function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  const { type, pendingProps: nextProps } = workInProgress;
  let nextChildren = nextProps.children;
  // 判断是否只有唯一文本子节点，这种情况不需要为子节点创建fiber节点
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

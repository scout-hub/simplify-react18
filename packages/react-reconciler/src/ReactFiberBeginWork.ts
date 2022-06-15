/*
 * @Author: Zhouqi
 * @Date: 2022-05-25 21:10:35
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-15 11:10:58
 */
import type { Fiber } from "./ReactInternalTypes";
import { Lanes, NoLanes } from "./ReactFiberLane";
import { shouldSetTextContent } from "packages/react-dom/src/client/ReactDOMHostConfig";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { renderWithHooks } from "./ReactFiberHooks";
import { processUpdateQueue } from "./ReactUpdateQueue";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from "./ReactWorkTags";

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
  } else {
    // mount阶段
    didReceiveUpdate = false;
  }
  // 在进入begin流程前，先清除workInProgress中的lanes，否则会导致HostRoot不能进入bailout逻辑，
  // 导致后续的更新不会触发，还会导致root上的pendingLanes一直不为空
  // 会让performConcurrentWorkOnRoot一直被schedule下去
  // workInProgress.lanes = NoLanes;
  switch (workInProgress.tag) {
    case HostRoot: {
      return updateHostRoot(current, workInProgress, renderLanes);
    }
    case IndeterminateComponent:
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type
      );
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      return null;
    // return updateHostText(current, workInProgress);
  }
  return null;
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
  processUpdateQueue(workInProgress);

  const nextState = workInProgress.memoizedState;
  // 获取要更新的jsx元素
  const nextChildren = nextState.element;

  // 新旧jsx对象没变，直接返回
  if (nextChildren === prevChildren) {
    return null;
  }

  // 创建子fiber节点
  reconcileChildren(current, workInProgress, nextChildren);

  // 返回子fiber节点
  return workInProgress.child;
}

/**
 * @description: 处理子fiber节点
 */
function reconcileChildren(current, workInProgress, nextChildren) {
  // current为null说明是首次创建阶段，除了hostRoot节点
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    // 说明是更新节点，hostRoot节点首次渲染也会进入这里
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
}

/**
 * @author: Zhouqi
 * @description: Function组件首次渲染会进入这里
 * @param _current
 * @param workInProgress
 * @param Component
 */
function mountIndeterminateComponent(_current, workInProgress, Component) {
  // value值是jsx经过babel处理后得到的vnode对象
  const value = renderWithHooks(_current, workInProgress, Component);
  // return;
  workInProgress.tag = FunctionComponent;
  reconcileChildren(null, workInProgress, value);
  return workInProgress.child;
}

function updateHostComponent(current, workInProgress) {
  const { type, pendingProps: nextProps } = workInProgress;
  let nextChildren = nextProps.children;
  // 判断是否只有唯一文本子节点，这种情况不需要为子节点创建fiber节点
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  } else {
    // TODO
  }
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

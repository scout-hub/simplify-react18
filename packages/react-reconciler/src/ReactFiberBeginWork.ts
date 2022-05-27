/*
 * @Author: Zhouqi
 * @Date: 2022-05-25 21:10:35
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-27 09:39:28
 */
import { reconcileChildFibers } from "./ReactChildFiber";
import { processUpdateQueue } from "./ReactUpdateQueue";
import { HostRoot } from "./ReactWorkTags";

export function beginWork(current, workInProgress) {
  // 首屏渲染只有hostRoot存在current节点，其他节点还未被创建
  // hostRoot的workInPgress树中的HostRoot是在prepareFreshStack函数中创建
  if (current !== null) {
    // update阶段，可以复用current（即旧的fiber节点）
  } else {
    // mount阶段
  }
  switch (workInProgress.tag) {
    case HostRoot: {
      return updateHostRoot(current, workInProgress);
    }
  }
}

function updateHostRoot(current, workInProgress) {
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
  if (current === null) {
    console.log(1);
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
}

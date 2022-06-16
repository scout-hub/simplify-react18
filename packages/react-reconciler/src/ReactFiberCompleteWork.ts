/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:23:10
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-16 22:20:57
 */
import type { Lanes } from "./ReactFiberLane";
import type { Fiber } from "./ReactInternalTypes";
import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
  prepareUpdate,
} from "packages/react-dom/src/client/ReactDOMHostConfig";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./ReactWorkTags";
import { Update } from "./ReactFiberFlags";

/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:23:10
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 13:22:37
 */
export function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // 函数式组件
    case FunctionComponent: {
      return null;
    }
    // 当前应用的根结点
    case HostRoot: {
      // const fiberRoot = workInProgress.stateNode;
      // console.log(fiberRoot);
      return null;
    }
    // 普通元素节点
    case HostComponent: {
      const type = workInProgress.type;
      if (current !== null && workInProgress !== null) {
        // 更新
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        // 创建元素
        const instance = createInstance(type, newProps, workInProgress);
        // 在归阶段的时候，子fiber对应的真实dom已经全部创建完毕，此时只需要
        // 将当前fiber节点的child fiber节点对应的真实dom添加到自身真实dom下
        appendAllChildren(instance, workInProgress);
        // 将stateNode指向当前创建的dom节点
        workInProgress.stateNode = instance;
        // 初始化挂载属性
        finalizeInitialChildren(instance, type, newProps);
      }
      return null;
    }
    // 处理文本节点
    case HostText: {
      workInProgress.stateNode = createTextInstance(newProps);
      return null;
    }
  }
  return null;
}

/**
 * @description: 更新普通元素
 */
function updateHostComponent(
  current: Fiber,
  workInProgress: Fiber,
  type: any,
  newProps: any
) {
  const oldProps = current.memoizedProps;
  // 新旧props一样，直接返回
  if (newProps === oldProps) {
    return;
  }
  const instance: Element = workInProgress.stateNode;
  // 新旧的属性不一样，找出变化的属性进行更新
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
  workInProgress.updateQueue = updatePayload;
  if (updatePayload) {
    markUpdate(workInProgress);
  }
}

/**
 * @description: 标记更新
 */
function markUpdate(workInProgress: Fiber) {
  workInProgress.flags |= Update;
}

/**
 * @description: 将子fiber对应的instance追加到自身中
 * @param parent
 * @param workInProgress
 */
function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
    }
    while (node.sibling === null) {
      // 处理父fiber
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }
    // 为兄弟fiber添加return指向父fiber
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

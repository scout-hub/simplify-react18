/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:41:18
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-30 17:37:17
 */
import { isString } from "packages/shared/src";
import { NoFlags } from "./ReactFiberFlags";
import {
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from "./ReactWorkTags";
import type { WorkTag } from "./ReactWorkTags";
import type { Fiber } from "./ReactInternalTypes";

/**
 * @description: 创建一个标记为HostRoot的fiber树根节点
 * @return fiber节点
 */
export function createHostRootFiber() {
  return createFiber(HostRoot, null, null);
}

/**
 * @description: 创建fiber节点
 * @param tag 元素类型
 * @param pendingProps 元素属性
 * @return fiber节点
 */
function createFiber(tag: WorkTag, pendingProps, key: null | string) {
  return new FiberNode(tag, pendingProps, key);
}

// Fiber类
class FiberNode {
  type = null;
  elementType = null;
  stateNode = null;
  return = null;
  sibling = null;
  child = null;
  index = 0;
  alternate = null;
  updateQueue = null;
  memoizedState = null;
  flags = NoFlags;

  constructor(public tag, public pendingProps, public key) {}
}

/**
 * @description: 创建内存中的fiber，即为当前节点创建一个新的fiber节点去工作（双缓存机制）
 * @param current 当前fiber节点
 * @return 内存中的fiber树
 */
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  }
  workInProgress.child = current.child;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  return workInProgress;
}

/**
 * @description: 创建元素的fiber节点
 */
export function createFiberFromElement(element) {
  const { type, key } = element;
  let pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(type, key, pendingProps);
  return fiber;
}

function createFiberFromTypeAndProps(type, key, pendingProps) {
  let fiberTag: WorkTag = IndeterminateComponent;
  if (isString(type)) {
    // 说明是普通元素节点
    fiberTag = HostComponent;
  }
  const fiber = createFiber(fiberTag, pendingProps, key);
  fiber.elementType = type;
  fiber.type = type;
  return fiber;
}

/**
 * @description: 创建文本节点对应的fiber
 */
export function createFiberFromText(content: string): Fiber {
  const fiber = createFiber(HostText, content, null);
  return fiber;
}

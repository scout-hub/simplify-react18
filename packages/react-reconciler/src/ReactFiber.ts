/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:41:18
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-18 20:52:27
 */
import { ClassComponent, WorkTag } from "./ReactWorkTags";
import type { Fiber } from "./ReactInternalTypes";
import type { Lanes } from "./ReactFiberLane";
import { isFunction, isString } from "packages/shared/src";
import { NoFlags, StaticMask } from "./ReactFiberFlags";
import { NoLanes } from "./ReactFiberLane";
import {
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from "./ReactWorkTags";

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
  updateQueue = null;
  memoizedState = null;
  memoizedProps = null;
  lanes = NoLanes;
  childLanes = NoLanes;
  flags = NoFlags;
  subtreeFlags = NoFlags;
  deletions = null;
  alternate = null;

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
  } else {
    workInProgress.pendingProps = pendingProps;
    // 复用current的一些属性值
    workInProgress.type = current.type;
    // 重置flags、subtreeFlags、deletions
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  workInProgress.flags = current.flags & StaticMask;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;

  workInProgress.child = current.child;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;

  return workInProgress;
}

/**
 * @description: 创建元素的fiber节点
 */
export function createFiberFromElement(element: any, lanes: Lanes): Fiber {
  const { type, key } = element;
  let pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(type, key, pendingProps, lanes);
  return fiber;
}

/**
 * @description: 根据type和props创建fiber
 */
function createFiberFromTypeAndProps(
  type: any,
  key: any,
  pendingProps: any,
  lanes: Lanes
): Fiber {
  let fiberTag: WorkTag = IndeterminateComponent;
  if (isFunction(type)) {
    // 判断是不是class组件
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent;
    }
  } else if (isString(type)) {
    // 说明是普通元素节点
    fiberTag = HostComponent;
  }
  // TODO 组件
  const fiber = createFiber(fiberTag, pendingProps, key);
  fiber.elementType = type;
  fiber.type = type;
  fiber.lanes = lanes;
  return fiber;
}

/**
 * @description: 通过原型上的isReactComponent判断是不是class组件
 */
function shouldConstruct(Component: Function) {
  const prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

/**
 * @description: 创建文本节点对应的fiber
 */
export function createFiberFromText(content: string, lanes: Lanes): Fiber {
  const fiber = createFiber(HostText, content, null);
  fiber.lanes = lanes;
  return fiber;
}

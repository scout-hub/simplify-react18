/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:41:18
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-27 15:27:08
 */
import { isString } from "packages/shared/src";
import { NoFlags } from "./ReactFiberFlags";
import {
  HostComponent,
  HostRoot,
  IndeterminateComponent,
} from "./ReactWorkTags";

/**
 * @description: 创建一个标记为HostRoot的fiber树根节点
 * @return fiber节点
 */
export function createHostRootFiber() {
  return createFiber(HostRoot, null);
}

/**
 * @description: 创建fiber节点
 * @param tag 元素类型
 * @return fiber节点
 */
function createFiber(tag, pendingProps) {
  return new FiberNode(tag, pendingProps);
}

// fiber类
class FiberNode {
  // 节点的类型，普通元素就是tag name，函数式组件就是function本身，class组件就是class
  type = null;
  // 元素的类型，是固定不变的，而type是可能会改变的
  elementType = null;
  // 指向应用节点FiberRootNode的指针
  stateNode: any = null;
  // 指向父fiberNode的指针
  return = null;
  // 指向兄弟fiberNode的指针
  sibling = null;
  // 指向子fiberNode的指针
  child = null;
  // 同级fiberNode的插入位置
  index: number = 0;
  // current fiber tree和work in progress fiber tree的连接
  alternate = null;
  // 更新队列
  updateQueue = null;
  // Fiber节点在本次更新的state
  memoizedState = null;
  // Effects
  flags = NoFlags;

  constructor(public tag, public pendingProps) {}
}

/**
 * @description: 创建内存中的fiber，即为当前节点创建一个新的fiber节点去工作（双缓存机制）
 * @param current 当前fiber节点
 * @return 内存中的fiber树
 */
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps);
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
  let fiberTag = IndeterminateComponent;
  if (isString(type)) {
    // 说明是普通元素节点
    fiberTag = HostComponent;
  }
  const fiber = createFiber(fiberTag, pendingProps);
  fiber.elementType = type;
  fiber.type = type;
  return fiber;
}

/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:41:18
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-26 15:24:31
 */
import { HostRoot } from "./ReactWorkTags";

/**
 * @description: 创建一个标记为HostRoot的fiber树根节点
 * @return fiber节点
 */
export function createHostRootFiber() {
  return createFiber(HostRoot);
}

/**
 * @description: 创建fiber节点
 * @param tag 元素类型
 * @return fiber节点
 */
function createFiber(tag) {
  return new FiberNode(tag);
}

// fiber类
class FiberNode {
  // 指向应用节点FiberRootNode的指针
  stateNode: any = null;
  // 指向父fiberNode的指针
  return = null;
  // 指向兄弟fiberNode的指针
  sibling = null;
  // 指向子fiberNode的指针
  child = null;
  // 节点的类型，普通元素就是tag name，函数式组件就是function本身，class组件就是class
  type = null;
  // 同级fiberNode的插入位置
  index: number = 0;
  // current fiber tree和work in progress fiber tree的连接
  alternate = null;
  updateQueue = null;
  memoizedState = null;

  constructor(public tag) {}
}

/**
 * @description: 创建内存中的fiber，即为当前节点创建一个新的fiber节点去工作（双缓存机制）
 * @param current 当前fiber节点
 * @return 内存中的fiber树
 */
export function createWorkInProgress(current) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  }
  workInProgress.child = current.child;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  return workInProgress;
}

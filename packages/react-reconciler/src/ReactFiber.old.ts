/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:41:18
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-19 21:15:40
 */
import { HostRoot } from "./ReactWorkTags";

export function createHostRootFiber() {
  return createFiber(HostRoot);
}

/**
 * @author: Zhouqi
 * @description: 创建fiber节点
 * @param tag 元素类型
 * @return
 */
function createFiber(tag) {
  return new FiberNode(tag);
}

// fiber类
class FiberNode {
  public tag;
  public stateNode;
  public return;
  public sibling;
  public child;
  public type;
  public index;
  public alternate;

  constructor(tag) {
    this.tag = tag;
    // 节点的类型，普通元素就是tag name，函数式组件就是function本身，class组件就是class
    this.type = null;
    // 指向应用节点FiberRootNode的指针
    this.stateNode = null;

    // fiber相关属性
    // 指向父fiberNode的指针
    this.return = null;
    // 指向兄弟fiberNode的指针
    this.sibling = null;
    // 指向子fiberNode的指针
    this.child = null;
    // 同级fiberNode的插入位置
    this.index = 0;

    // 优先级调度相关属性
    // this.lanes;
    // this.childLanes = null;

    // 双缓存工作机制相关
    // current fiber tree和work in progress fiber tree的连接
    this.alternate = null;
  }
}

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

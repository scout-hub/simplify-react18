/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:20:49
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-16 22:20:08
 */
import { createHostRootFiber } from "./ReactFiber.old";

export function createFiberRoot(containerInfo, tag) {
  // 1、创建整个应用的fibeRootNode，这个fibeRootNode用来管理底下所有的fiberNode
  // 2、每个页面有且只能有一个应用的fibeRootNode，可以有多个根rootFiber
  const root = new FiberRootNode(containerInfo);
  // 创建一个未初始化的当前应用的根rootFiber
  const uninitializedFiber = createHostRootFiber();
  // 将rootFiberNode的current指向这个未初始化的rootFiber
  root.current = uninitializedFiber;
  // 整个应用的根节点指向FiberRootNode
  uninitializedFiber.stateNode = root;
  return root;
}

class FiberRootNode {
  public containerInfo;
  public current;
  public finishedWork;

  constructor(containerInfo) {
    this.containerInfo = containerInfo;
    this.current = null;
    this.finishedWork = null;
  }
}

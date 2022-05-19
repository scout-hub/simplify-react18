/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:20:49
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-19 10:37:46
 */
import { createHostRootFiber } from "./ReactFiber.old";

export function createFiberRoot(containerInfo, tag) {
  // 1、创建整个React应用的FiberRootNode，这个FiberRootNode是一个管理者的作用
  // 2、一个React应用只能有一个FiberRootNode
  // 3、一个FiberRootNode下可以有多个RootFiber
  const root = new FiberRootNode(containerInfo, tag);
  // 1、创建未初始化的的RootFiber
  // 2、通过调用ReactDOM.render渲染出来的，比如ReactDOM.render(<App />,xxxx)，其中App就是一个RootFiber
  const uninitializedFiber = createHostRootFiber();
  // 将FiberRootNode的current指向这个未初始化的RootFiber
  root.current = uninitializedFiber;
  // 当前应用（App）的stateNode指向FiberRootNode
  uninitializedFiber.stateNode = root;
  return root;
}

class FiberRootNode {
  public containerInfo;
  public current;
  public finishedWork;
  public tag;

  constructor(containerInfo, tag) {
    // 容器信息
    this.containerInfo = containerInfo;
    // 指向当前的RootFiber应用
    this.current = null;
    // Fiber标签，表示Fiber的类型
    this.tag = tag;
    this.finishedWork = null;
  }
}

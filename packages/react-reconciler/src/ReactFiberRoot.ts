/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:20:49
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-17 14:17:52
 */
import type { Fiber } from "./ReactInternalTypes";
import { createHostRootFiber } from "./ReactFiber";
import { initializeUpdateQueue } from "./ReactUpdateQueue";
import { createLaneMap, NoLane, NoLanes, NoTimestamp } from "./ReactFiberLane";

export function createFiberRoot(containerInfo, tag, initialChildren = null) {
  // 1、创建整个React应用的FiberRootNode，这个FiberRootNode是一个管理者的作用
  // 2、一个React应用只能有一个FiberRootNode
  // 3、一个FiberRootNode下可以有多个RootFiber
  const root = new FiberRootNode(containerInfo, tag);
  // 1、创建未初始化的的RootFiber
  // 2、通过调用ReactDOM.render渲染出来的，比如ReactDOM.render(<App />,xxxx)，其中App就是一个RootFiber
  const uninitializedFiber: Fiber = createHostRootFiber();
  // 将FiberRootNode的current指向这个未初始化的RootFiber
  root.current = uninitializedFiber;
  // 当前应用（App）的stateNode指向FiberRootNode
  uninitializedFiber.stateNode = root;
  const initialState = {
    element: initialChildren,
  };
  uninitializedFiber.memoizedState = initialState;
  initializeUpdateQueue(uninitializedFiber);
  return root;
}

class FiberRootNode {
  current: any = null; // 指向当前的RootFiber应用
  finishedWork = null;
  callbackNode = null;
  callbackPriority = NoLane;
  pendingLanes = NoLane;
  expiredLanes = NoLanes;
  eventTimes = createLaneMap(NoLanes);
  expirationTimes = createLaneMap(NoTimestamp); // 过期的lane数组

  constructor(public containerInfo, public tag) {}
}

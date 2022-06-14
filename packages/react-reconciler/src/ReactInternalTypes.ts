/*
 * @Author: Zhouqi
 * @Date: 2022-05-30 15:32:37
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-14 09:50:18
 */
import type { Flags } from "./ReactFiberFlags";
import type { Lanes } from "./ReactFiberLane";
import type { WorkTag } from "./ReactWorkTags";

export type Fiber = {
  // 静态数据结构的属性
  tag: WorkTag; // 标识fiber类型，如HostComponent，FunctionComponent，HostRoot
  type: any; // 普通元素就是tag name，函数式组件就是function本身，class组件就是class
  key: null | string; // key属性
  elementType: any; // 元素的类型，是固定不变的，而type可能会改变
  stateNode: any; // fiber节点对应的真实dom节点

  // 关联其他Fiber节点形成Fiber树的属性
  return: Fiber | null; // 指向父fiberNode的指针
  sibling: Fiber | null; // 指向兄弟fiberNode的指针
  child: Fiber | null; // 指向第一个子fiberNode的指针
  index: number; // 当前fiberNode在所有同层级fiberNode中的位置索引

  // 保存本次更新造成的状态改变相关信息的属性
  updateQueue: any; // 存放该fiber节点所有的更新
  memoizedState: any; // 类组件保存state信息，函数组件保存hooks信息，dom元素为null
  flags: Flags; // 标记fiber effect，比如改fiber节点需要插入还是更新
  pendingProps: any; // 新的props
  memoizedProps: any; // 记录上一次更新完毕后的props

  // 调度优先级相关
  lanes: Lanes;
  childLanes: Lanes;

  // 指向该fiber在另一次更新时对应的fiber
  alternate: Fiber | null; // 双缓存树，指向缓存的fiber。更新阶段，两颗树互相交替。
};

export type Dispatch<A> = (a: A) => void;
export type BasicStateAction<S> = ((a: S) => S) | S;

export type Dispatcher = {
  useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>];
};

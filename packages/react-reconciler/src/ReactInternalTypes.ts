/*
 * @Author: Zhouqi
 * @Date: 2022-05-30 15:32:37
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-30 15:49:33
 */
import { Flags } from "./ReactFiberFlags";
import { WorkTag } from "./ReactWorkTags";

export type Fiber = {
  // 标识fiber类型，如HostComponent，FunctionComponent，HostRoot
  tag: WorkTag;
  // 普通元素就是tag name，函数式组件就是function本身，class组件就是class
  type: any;
  key: null | string;
  // 元素的类型，是固定不变的，而type可能会改变
  elementType: any;
  // 指向fiber节点对应的真实dom节点
  stateNode: any;
  // 指向父fiberNode的指针
  return: Fiber | null;
  // 指向兄弟fiberNode的指针
  sibling: Fiber | null;
  // 指向直接子fiberNode的指针
  child: Fiber | null;
  // 当前fiberNode在所有同层级fiberNode中的位置索引
  index: number;
  // current fiber和workInProgress fiber之间的连接
  alternate: Fiber | null;
  // 存放该fiber节点所有的更新
  updateQueue: any;
  // state状态
  memoizedState: any;
  // 
  flags: Flags;
  // 内容状态中的props
  pendingProps: any;
};

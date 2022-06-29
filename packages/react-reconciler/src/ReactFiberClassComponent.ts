/*
 * @Author: Zhouqi
 * @Date: 2022-06-18 21:00:04
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-29 11:57:40
 */
import { NoLanes } from "./ReactFiberLane";
import { assign, isFunction } from "packages/shared/src";
import { Fiber } from "./ReactInternalTypes";
import { initializeUpdateQueue, UpdateQueue } from "./ReactUpdateQueue";
import type { Lanes } from "./ReactFiberLane";

/**
 * @description: 生成class组件实例
 */
export function constructClassInstance(
  workInProgress: Fiber,
  ctor: any,
  props: any
) {
  let instance = new ctor(props);
  // 获取组件实例上定义的state
  const state = instance.state;
  workInProgress.memoizedState = state == null ? null : state;
  adoptClassInstance(workInProgress, instance);
  return instance;
}

const classComponentUpdater = {};

/**
 * @description: 收集组件实例
 */
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  workInProgress.stateNode = instance;
  instance.updater = classComponentUpdater;
}

/**
 * @description: 挂载class组件实例
 */
export function mountClassInstance(
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderLanes: Lanes
) {
  const instance = workInProgress.stateNode;
  instance.props = newProps;
  instance.state = workInProgress.memoizedState;
  // 初始化更新队列
  initializeUpdateQueue(workInProgress);
  // class（不是实例上获取）上获取getDerivedStateFromProps生命周期函数
  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  if (isFunction(getDerivedStateFromProps)) {
    // 执行getDerivedStateFromProps生命周期函数，这个函数是在finishClassComponent（render）之前执行的
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps
    );
    // 更新instance上的state
    instance.state = workInProgress.memoizedState;
  }
}

function applyDerivedStateFromProps(
  workInProgress: Fiber,
  ctor: any,
  getDerivedStateFromProps: (props: any, state: any) => any,
  nextProps: any
) {
  const prevState = workInProgress.memoizedState;
  // 执行getDerivedStateFromProps函数获取新的state
  const partialState = getDerivedStateFromProps(nextProps, prevState);
  // 如果partialState是null或者undefined，则不更新当前的state，否则合并新旧state
  const memoizedState =
    partialState == null ? prevState : assign({}, prevState, partialState);
  workInProgress.memoizedState = memoizedState;
  // 如果当前没有任务需要更新，则直接将state作为基状态
  // TODD 在beginWork阶段，会把workInProgress.lanes赋值为noLanes，下面这个判断一直是true？？？？
  if (workInProgress.lanes === NoLanes) {
    const updateQueue: UpdateQueue<any> = workInProgress.updateQueue;
    updateQueue.baseState = memoizedState;
  }
}

/**
 * @description: 更新class组件实例
 */
export function updateClassInstance(
  current: Fiber,
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderLanes: Lanes
): boolean {
  return true;
}

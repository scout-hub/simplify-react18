/*
 * @Author: Zhouqi
 * @Date: 2022-06-18 21:00:04
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-18 21:07:45
 */
import { Fiber } from "./ReactInternalTypes";

/**
 * @description: 生成class组件实例
 */
export function constructClassInstance(
  workInProgress: Fiber,
  ctor: any,
  props: any
) {
  let instance = new ctor(props);
  adoptClassInstance(workInProgress, instance);
  return instance;
}

/**
 * @description: 挂载组件实例
 */
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  workInProgress.stateNode = instance;
}

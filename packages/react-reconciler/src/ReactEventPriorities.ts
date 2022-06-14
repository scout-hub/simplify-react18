/*
 * @Author: Zhouqi
 * @Date: 2022-06-14 12:32:30
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-14 12:42:49
 */
import { DefaultLane, Lane } from "./ReactFiberLane";
import { NoLane } from "./ReactFiberLane";

export type EventPriority = Lane;

export const DefaultEventPriority: EventPriority = DefaultLane;

let currentUpdatePriority: EventPriority = NoLane;

/**
 * @description: 获取当前事件更新的优先级
 */
export function getCurrentUpdatePriority(): EventPriority {
  return currentUpdatePriority;
}

/**
 * @description: 设置当前事件更新的优先级
 */
export function setCurrentUpdatePriority(newPriority: EventPriority) {
  currentUpdatePriority = newPriority;
}

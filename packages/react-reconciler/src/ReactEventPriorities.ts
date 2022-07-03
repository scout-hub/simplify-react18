/*
 * @Author: Zhouqi
 * @Date: 2022-06-14 12:32:30
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 11:03:44
 */
import {
  DefaultLane,
  getHighestPriorityLane,
  IdleLane,
  includesNonIdleWork,
  InputContinuousLane,
  Lane,
  Lanes,
} from "./ReactFiberLane";
import { NoLane } from "./ReactFiberLane";
import { SyncLane } from "./ReactFiberLane";

export type EventPriority = Lane;

export const DiscreteEventPriority: EventPriority = SyncLane;
export const ContinuousEventPriority: EventPriority = InputContinuousLane;
export const DefaultEventPriority: EventPriority = DefaultLane;
export const IdleEventPriority: EventPriority = IdleLane;

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

function isHigherEventPriority(a: EventPriority, b: EventPriority): boolean {
  return a !== 0 && a < b;
}

/**
 * @description: 将lane优先级转化为事件优先级
 */
export function lanesToEventPriority(lanes: Lanes): EventPriority {
  // 找到优先级最高的lane
  const lane = getHighestPriorityLane(lanes);
  // lane的优先级高于DiscreteEventPriority，直接返回DiscreteEventPriority
  if (!isHigherEventPriority(DiscreteEventPriority, lane)) {
    return DiscreteEventPriority;
  }
  if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
    return ContinuousEventPriority;
  }
  // 有lane被占用，但是优先级没有上面的两个高，返回DefaultEventPriority
  if (includesNonIdleWork(lane)) {
    return DefaultEventPriority;
  }
  return IdleEventPriority;
}

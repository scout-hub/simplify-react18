/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 11:10:29
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-14 14:13:09
 */
import type { Fiber, FiberRoot } from "./ReactInternalTypes";

export type Lanes = number;
export type Lane = number;
export type LaneMap<T> = Array<T>;

export const TotalLanes = 31;

export const NoTimestamp = -1;

// 无优先级，初始化的优先级
export const NoLanes: Lanes = 0b0000000000000000000000000000000;
export const NoLane: Lane = 0b0000000000000000000000000000000;
// 同步更新的优先级为最高优先级
export const SyncLane = 0b0000000000000000000000000000001;

export const DefaultLane: Lane = 0b0000000000000000000000000010000;

/**
 * @description: 创建31位的lane数组
 */
export function createLaneMap<T>(initial: T): LaneMap<T> {
  const laneMap: LaneMap<T> = [];
  for (let i = 0; i < TotalLanes; i++) {
    laneMap.push(initial);
  }
  return laneMap;
}

/**
 * @description: 合并优先级
 */
export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
  return a | b;
}

/**
 * @description:  将当前需要更新的lane添加到fiberRoot的pendingLanes属性上，表示有新的更新任务需要被执行
 * 通过计算出当前lane的位置，添加事件触发时间到eventTimes中
 */
export function markRootUpdated(
  root: FiberRoot,
  updateLane: Lane,
  eventTime: number
) {
  root.pendingLanes |= updateLane;
  // 一个三十一位的数组，分别对应着31位lane
  const eventTimes = root.eventTimes;
  const index = laneToIndex(updateLane);
  eventTimes[index] = eventTime;
}

/**
 * @description: 1、为当前任务根据优先级添加过期时间
 * 2、检查未执行的任务中是否有任务过期，有任务过期则expiredLanes中添加该任务的lane，在后续任务执行中以同步模式执行，避免饥饿问题
 */
export function markStarvedLanesAsExpired(
  root: FiberRoot,
  currentTime: number
) {
  console.log(root);
  console.log(currentTime);
}

/**
 * @description:
 * 返回该lane所在bit位在bitset中index
 * 比如
 * 0b001 就会返回0
 * 0b010 就会返回1
 * 0b100 就会返回2
 */
function laneToIndex(lane: Lane) {
  return pickArbitraryLaneIndex(lane);
}

function pickArbitraryLaneIndex(lanes: Lanes) {
  return 31 - Math.clz32(lanes);
}

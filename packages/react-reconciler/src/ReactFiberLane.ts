/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 11:10:29
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-14 22:08:00
 */
import type { FiberRoot } from "./ReactInternalTypes";

export type Lanes = number;
export type Lane = number;
export type LaneMap<T> = Array<T>;

// lane使用31位二进制来表示优先级车道共31条, 位数越小（1的位置越靠右）表示优先级越高
export const TotalLanes = 31;

export const NoTimestamp = -1;

// 无优先级，初始化的优先级
export const NoLanes: Lanes = 0b0000000000000000000000000000000;
export const NoLane: Lane = 0b0000000000000000000000000000000;

// 同步更新的优先级为最高优先级
export const SyncLane = 0b0000000000000000000000000000001;

export const InputContinuousHydrationLane: Lane = 0b0000000000000000000000000000010;
export const InputContinuousLane: Lane = 0b0000000000000000000000000000100;

// 默认优先级，例如使用setTimeout，请求数据返回等造成的更新
export const DefaultLane: Lane = 0b0000000000000000000000000010000;

export const IdleLane: Lane = 0b0100000000000000000000000000000;

// 所有未闲置的1的位置，通过 & NonIdleLanes就能知道是否有未闲置的任务 1 & 1 ==> 1 1 & 0 ==> 0
const NonIdleLanes: Lanes = 0b0001111111111111111111111111111;

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
 *
 * 饥饿问题：
 * 当某个任务因为其他过多高优先级任务的插入导致迟迟不能执行时，就会出现饥饿问题
 */
export function markStarvedLanesAsExpired(
  root: FiberRoot,
  currentTime: number
) {
  const pendingLanes = root.pendingLanes;
  const expirationTimes = root.expirationTimes;

  let lanes = pendingLanes;
  while (lanes > 0) {
    // 获取当前31位lanes中最左边1的位置
    const index = pickArbitraryLaneIndex(lanes);
    // 根据位置计算lane值
    const lane = 1 << index;
    // 获取该位置上任务的过期时间
    const expirationTime = expirationTimes[index];
    // 如果没有过期时间，则创建一个过期时间
    if (expirationTime === NoTimestamp) {
      expirationTimes[index] = computeExpirationTime(lane, currentTime);
    } else if (expirationTime <= currentTime) {
      // 如果任务已经过期，将当前的lane添加到expiredLanes中
      root.expiredLanes |= lane;
    }
    // 从lanes中删除lane, 每次循环删除一个，直到lanes等于0
    lanes &= ~lane;
  }
}

/**
 * @description: 获取当前任务的优先级
 *  wipLanes是正在执行任务的lane，nextLanes是本次需要执行的任务的lane
 *
 */
export function getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes {
  // 每一个任务都会将它们各自的优先级添加到fiberRoot的pendingLanes的属性上，这里获取
  // 了所有将要执行的任务的lane
  const pendingLanes = root.pendingLanes;

  // pendingLanes为空，说明所有的任务都执行完了
  if (pendingLanes === NoLanes) {
    return NoLanes;
  }

  let nextLanes = NoLanes;

  // 是否有非空闲的任务，如果有非空闲的任务，需要先执行非空闲的任务，不要去执行空闲的任务
  const nonIdlePendingLanes = pendingLanes & NonIdleLanes;
  // 有未闲置的任务
  if (nonIdlePendingLanes !== NoLanes) {
    // 获取除挂起任务外最高优先级任务的优先级，这里暂时不考虑挂起任务
    nextLanes = getHighestPriorityLanes(nonIdlePendingLanes);
    // TODO 从挂起任务中获取最高优先级任务的优先级
  } else {
    // TODO
  }

  if (nextLanes === NoLanes) {
    return NoLanes;
  }

  // 说明在渲染阶段插入了一个新的任务 ???
  if (wipLanes !== NoLanes && wipLanes !== nextLanes) {
    const nextLane = getHighestPriorityLane(nextLanes);
    const wipLane = getHighestPriorityLane(wipLanes);

    // 如果新添加任务优先级低，则依旧返回当前渲染中的任务的优先级
    if (nextLane >= wipLane) {
      return wipLanes;
    }
  }

  return nextLanes;
}

/**
 * @description: 标记root更新完成后的相关状态
 */
export function markRootFinished(root: FiberRoot, remainingLanes: Lanes) {}

export function includesBlockingLane(root: FiberRoot, lanes: Lanes) {
  const SyncDefaultLanes = InputContinuousLane | DefaultLane;
  return (lanes & SyncDefaultLanes) !== NoLanes;
}

export function includesExpiredLane(root: FiberRoot, lanes: Lanes) {
  return (lanes & root.expiredLanes) !== NoLanes;
}

/**
 * @description: 获得一个二进制数中以最低位1所形成的数
 * 比如 0b101 & -0b101 ===> 0b001 === 1;  0b110 & -0b110 ===> 0b010 === 2
 */
export function getHighestPriorityLane(lanes: Lanes): Lane {
  return lanes & -lanes;
}

export function includesNonIdleWork(lanes: Lanes) {
  return (lanes & NonIdleLanes) !== NoLanes;
}

/**
 * @description: 从lanes中获取最高优先级的lane
 */
function getHighestPriorityLanes(lanes: Lanes | Lane): Lanes {
  switch (getHighestPriorityLane(lanes)) {
    case SyncLane:
      return SyncLane;
    case DefaultLane:
      return DefaultLane;
    default: {
      return lanes;
    }
  }
}

/**
 * @description: 根据优先级计算任务过期时间
 */
function computeExpirationTime(lane: Lane, currentTime: number) {
  switch (lane) {
    case SyncLane:
      return currentTime + 250;
    case DefaultLane:
      return currentTime + 5000;
    default: {
      return NoTimestamp;
    }
  }
}

/**
 * @description: 返回该lane所在bit位在bitset中index
 * 比如：0b001 就会返回0；0b010 就会返回1
 */
function laneToIndex(lane: Lane) {
  return pickArbitraryLaneIndex(lane);
}

function pickArbitraryLaneIndex(lanes: Lanes) {
  return 31 - Math.clz32(lanes);
}

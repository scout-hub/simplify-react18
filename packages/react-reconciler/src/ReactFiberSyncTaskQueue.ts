/*
 * @Author: Zhouqi
 * @Date: 2022-06-15 17:23:33
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-06-01 10:56:19
 */
import {
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  setCurrentUpdatePriority,
} from "./ReactEventPriorities";
import {
  ImmediatePriority,
  scheduleCallback,
  SchedulerCallback,
} from "./Scheduler";

let syncQueue: Array<SchedulerCallback> | null = null;
// 标记是否已经在执行同步任务
let isFlushingSyncQueue: boolean = false;

/**
 * @description: syncQueue添加同步任务
 */
export function scheduleSyncCallback(callback: SchedulerCallback) {
  if (syncQueue === null) {
    // 如果syncQueue为null，则创建一个新的数组
    syncQueue = [callback];
  } else {
    // 否则将callback添加到syncQueue数组的末尾
    syncQueue.push(callback);
  }
}

/**
 * @description:  同步执行任务
 */
export function flushSyncCallbacks() {
  // 防止重复执行
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true;
    let i = 0;
    const previousUpdatePriority = getCurrentUpdatePriority();
    try {
      const isSync = true;
      const queue = syncQueue;
      setCurrentUpdatePriority(DiscreteEventPriority);
      for (; i < queue.length; i++) {
        let callback: SchedulerCallback | null = queue[i];
        do {
          callback = callback(isSync);
        } while (callback !== null);
      }
      syncQueue = null;
    } catch (error) {
      // 当前任务执行出错，跳过它执行下一个任务
      if (syncQueue !== null) {
        syncQueue = syncQueue.slice(i + 1);
      }
      scheduleCallback(ImmediatePriority, flushSyncCallbacks);
      throw error;
    } finally {
      setCurrentUpdatePriority(previousUpdatePriority);
      isFlushingSyncQueue = false;
    }
  }
}

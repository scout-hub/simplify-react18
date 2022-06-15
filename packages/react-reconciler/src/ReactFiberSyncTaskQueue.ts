/*
 * @Author: Zhouqi
 * @Date: 2022-06-15 17:23:33
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-15 17:25:46
 */
import { SchedulerCallback } from "./Scheduler";

let syncQueue: Array<SchedulerCallback> | null = null;

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

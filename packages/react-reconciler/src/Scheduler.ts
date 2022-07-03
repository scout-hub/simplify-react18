/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 11:58:34
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 11:14:29
 */
import * as Scheduler from "scheduler";

export const now = Scheduler.unstable_now;
export const scheduleCallback = Scheduler.unstable_scheduleCallback;
export const cancelCallback = Scheduler.unstable_cancelCallback;
export const ImmediatePriority = Scheduler.unstable_ImmediatePriority;
export const UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
export const NormalPriority = Scheduler.unstable_NormalPriority;
export const LowPriority = Scheduler.unstable_LowPriority;
export const IdlePriority = Scheduler.unstable_IdlePriority;
export const shouldYield = Scheduler.unstable_shouldYield;

export type SchedulerCallback = (isSync: boolean) => SchedulerCallback | null;

/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 11:58:34
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-14 16:15:20
 */
import * as Scheduler from 'packages/scheduler/src/forks/Scheduler';

export const now = Scheduler.unstable_now;
export const scheduleCallback = Scheduler.unstable_scheduleCallback;
export const cancelCallback = Scheduler.unstable_cancelCallback;
/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 11:10:29
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-14 10:10:52
 */
export type Lanes = number;
export type Lane = number;

// 无优先级，初始化的优先级
export const NoLanes: Lanes = 0b0000000000000000000000000000000;
export const NoLane: Lane = 0b0000000000000000000000000000000;
// 同步更新的优先级为最高优先级
export const SyncLane = 0b0000000000000000000000000000001;

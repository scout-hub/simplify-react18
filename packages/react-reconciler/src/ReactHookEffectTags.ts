/*
 * @Author: Zhouqi
 * @Date: 2022-06-24 16:57:49
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-24 16:57:58
 */
export type HookFlags = number;
export const NoFlags = 0b0000;
export const HasEffect = 0b0001;
export const Passive = 0b1000;

/*
 * @Author: Zhouqi
 * @Date: 2022-06-24 16:57:49
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-26 17:04:09
 */
export type HookFlags = number;
export const NoFlags = 0b0000;
export const HasEffect = 0b0001;
export const Insertion = 0b0010;
export const Layout = 0b0100;
export const Passive = 0b1000;

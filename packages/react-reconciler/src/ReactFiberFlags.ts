/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 13:28:53
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-16 22:20:41
 */
export type Flags = number;

export const NoFlags = 0b00000000000000000000000000;
export const Placement = 0b00000000000000000000000010;
export const Update = 0b00000000000000000000000100;
export const ChildDeletion = 0b00000000000000000000010000;

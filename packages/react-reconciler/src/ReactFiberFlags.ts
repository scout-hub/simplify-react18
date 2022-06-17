/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 13:28:53
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-17 14:47:42
 */
export type Flags = number;

export const NoFlags =          0b00000000000000000000000000;
export const Placement =        0b00000000000000000000000010;
export const Update =           0b00000000000000000000000100;
export const ChildDeletion =    0b00000000000000000000010000;

export const Forked =           0b00000100000000000000000000;

export const RefStatic =        0b00001000000000000000000000;
export const LayoutStatic =     0b00010000000000000000000000;
export const PassiveStatic =    0b00100000000000000000000000;

export const StaticMask = LayoutStatic | PassiveStatic | RefStatic;
export const MutationMask = Placement | Update | ChildDeletion;

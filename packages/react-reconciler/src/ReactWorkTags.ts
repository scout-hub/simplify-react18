/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:39:57
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-28 11:19:31
 */
export type WorkTag =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25;

// Function组件
export const FunctionComponent = 0;
// Class组件
export const ClassComponent = 1;
// 还不知道是function还是class类型
export const IndeterminateComponent = 2;
// 当前应用的根节点
export const HostRoot = 3;
// 原生dom元素对应的fiber节点类型
export const HostComponent = 5;
// 文本类型
export const HostText = 6;
// 片段
export const Fragment = 7;
// react memo
export const MemoComponent = 14;
// simple react memo
export const SimpleMemoComponent = 15;

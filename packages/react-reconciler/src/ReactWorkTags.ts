/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:39:57
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-30 15:27:42
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

// 当前应用的根节点
export const HostRoot = 3;
// Function组件标记
export const IndeterminateComponent = 2; // Before we know whether it is function or class
export const FunctionComponent = 0;
// 原生dom元素对应的fiber节点类型
export const HostComponent = 5;

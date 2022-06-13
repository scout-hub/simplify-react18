/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 13:41:21
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-13 22:08:23
 */
export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const NoPriority = 0; // 初始化的优先级
export const ImmediatePriority = 1; // 需要立即执行 最高优先级
export const UserBlockingPriority = 2; // 250ms 超时时间250ms，一般指的是用户交互（比如用户点击按钮通过setState创建的update拥有的优先级）
export const NormalPriority = 3; // 5000ms 超时时间5s，不需要直观立即变化的任务，比如网络请求返回数据更新状态
export const LowPriority = 4; // 10000ms 超时时间10s，肯定要执行的任务，但是可以放在最后处理（suspense）
export const IdlePriority = 5; // 一些没有必要的任务，可能不会执行

/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 13:41:21
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-19 13:45:37
 */
export const ImmediatePriority = 1; // 需要立即执行
export const UserBlockingPriority = 2; // 250ms 超时时间250ms，一般指的是用户交互
export const NormalPriority = 3; // 5000ms 超时时间5s，不需要直观立即变化的任务，比如网络请求
export const LowPriority = 4; // 10000ms 超时时间10s，肯定要执行的任务，但是可以放在最后处理
export const IdlePriority = 5; // 一些没有必要的任务，可能不会执行

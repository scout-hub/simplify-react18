/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 15:17:12
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 15:18:29
 */
/**
 * @description: 绑定冒泡事件
 */
export function addEventBubbleListener(
  target: EventTarget,
  eventType: string,
  listener: EventListenerOrEventListenerObject
) {
  target.addEventListener(eventType, listener, false);
  return listener;
}

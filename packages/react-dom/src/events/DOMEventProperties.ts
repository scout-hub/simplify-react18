/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 13:52:17
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 15:16:20
 */
import { DOMEventName } from "./DOMEventNames";
import { registerTwoPhaseEvent } from "./EventRegistry";

export const topLevelEventsToReactNames: Map<DOMEventName, string> = new Map();

const simpleEventPluginEvents = ["click", "mouseDown"];

/**
 * @description: 简单事件注册函数
 * @param domEventName dom上的事件名
 * @param reactName react上的事件名
 */
function registerSimpleEvent(domEventName, reactName) {
  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]);
}

export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i];
    const domEventName = eventName.toLowerCase();
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
    registerSimpleEvent(domEventName, "on" + capitalizedEvent);
  }
}

export { DiscreteEventPriority } from "./ReactEventPriorities";

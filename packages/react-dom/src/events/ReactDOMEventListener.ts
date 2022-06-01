/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 15:02:16
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 15:09:58
 */
import { DOMEventName } from "./DOMEventNames";
import { EventSystemFlags } from "./EventSystemFlags";
import { DiscreteEventPriority } from "./ReactEventPriorities";

export function createEventListenerWrapperWithPriority(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags
) {
  const eventPriority = getEventPriority(domEventName);
  let listenerWrapper;
  switch (eventPriority) {
    case DiscreteEventPriority:
      listenerWrapper = dispatchDiscreteEvent;
      break;
  }
  return listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer
  );
}

/**
 * @description: 获取事件优先级
 * @param {DOMEventName} domEventName
 */
function getEventPriority(domEventName: DOMEventName) {
  switch (domEventName) {
    case "click":
    case "mousedown":
      return DiscreteEventPriority;
  }
}

function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  console.log(1);
}

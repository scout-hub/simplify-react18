/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 15:02:16
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 15:43:27
 */
import { DOMEventName } from "./DOMEventNames";
import { dispatchEventForPluginEventSystem } from "./DOMPluginEventSystem";
import { EventSystemFlags } from "./EventSystemFlags";
import { AnyNativeEvent } from "./PluginModuleType";
import { DiscreteEventPriority } from "./ReactEventPriorities";

export let return_targetInst = null;

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
 * @description: 事件触发函数
 */
function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
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

/**
 * @description: 触发事件
 */
function dispatchEvent(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent
) {
  dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(
    domEventName,
    eventSystemFlags,
    targetContainer,
    nativeEvent
  );
}

function dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent
) {
  dispatchEventForPluginEventSystem(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    return_targetInst,
    targetContainer
  );
}

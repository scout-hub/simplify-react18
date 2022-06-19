/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 15:02:16
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-19 15:51:06
 */
import {
  DefaultEventPriority,
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  setCurrentUpdatePriority,
} from "packages/react-reconciler/src/ReactEventPriorities";
import { getClosestInstanceFromNode } from "../client/ReactDOMComponentTree";
import { DOMEventName } from "./DOMEventNames";
import { dispatchEventForPluginEventSystem } from "./DOMPluginEventSystem";
import { EventSystemFlags } from "./EventSystemFlags";
import getEventTarget from "./getEventTarget";
import { AnyNativeEvent } from "./PluginModuleType";

export let return_targetInst = null;

/**
 * @description: 为事件做优先级划分
 */
export function createEventListenerWrapperWithPriority(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags
) {
  // 根据不同的事件做优先级分类
  const eventPriority = getEventPriority(domEventName);
  let listenerWrapper;
  // 根据优先级设置事件触发的回调函数
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
  const previousPriority = getCurrentUpdatePriority();
  // 设置事件的优先级
  setCurrentUpdatePriority(DiscreteEventPriority);
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  setCurrentUpdatePriority(previousPriority);
}

/**
 * @description: 根据不同的事件做优先级分类
 * @param {DOMEventName} domEventName
 */
export function getEventPriority(domEventName: DOMEventName) {
  switch (domEventName) {
    case "click":
    case "mousedown":
      // 同步优先级，最高
      return DiscreteEventPriority;
    default:
      return DefaultEventPriority;
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
  findInstanceBlockingEvent(
    domEventName,
    eventSystemFlags,
    targetContainer,
    nativeEvent
  );
  dispatchEventForPluginEventSystem(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    return_targetInst,
    targetContainer
  );
}

function findInstanceBlockingEvent(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent
) {
  return_targetInst = null;
  const nativeEventTarget = getEventTarget(nativeEvent);
  let targetInst = getClosestInstanceFromNode(nativeEventTarget);
  return_targetInst = targetInst;
}

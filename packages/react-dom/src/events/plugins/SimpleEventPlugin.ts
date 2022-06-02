/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 13:51:07
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-02 11:07:49
 */
import type { Fiber } from "packages/react-reconciler/src/ReactInternalTypes";
import type { DOMEventName } from "../DOMEventNames";
import {
  accumulateSinglePhaseListeners,
  DispatchQueue,
} from "../DOMPluginEventSystem";
import { EventSystemFlags, IS_CAPTURE_PHASE } from "../EventSystemFlags";
import type { AnyNativeEvent } from "../PluginModuleType";
import {
  registerSimpleEvents,
  topLevelEventsToReactNames,
} from "../DOMEventProperties";
import { SyntheticEvent, SyntheticMouseEvent } from "../SyntheticEvent";

function extractEvents(
  dispatchQueue: DispatchQueue,
  domEventName: DOMEventName,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget
) {
  const reactName = topLevelEventsToReactNames.get(domEventName);
  if (!reactName) {
    return;
  }

  let SyntheticEventCtor = SyntheticEvent;
  let reactEventType: string = domEventName;

  switch (domEventName) {
    case "click":
    case "mousedown":
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
  }

  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  const accumulateTargetOnly = false;

  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    inCapturePhase,
    accumulateTargetOnly,
    nativeEvent
  );
  if (listeners.length > 0) {
    const event = new SyntheticEventCtor(
      reactName,
      reactEventType,
      null,
      nativeEvent as any,
      nativeEventTarget
    );
    dispatchQueue.push({ event, listeners });
  }
}

export { registerSimpleEvents as registerEvents, extractEvents };

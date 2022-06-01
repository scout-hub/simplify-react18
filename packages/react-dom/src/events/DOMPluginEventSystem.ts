/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 13:53:51
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 17:44:39
 */
import type { Fiber } from "packages/react-reconciler/src/ReactInternalTypes";
import { HostComponent } from "packages/react-reconciler/src/ReactWorkTags";
import { DOMEventName } from "./DOMEventNames";
import { addEventBubbleListener } from "./EventListener";
import { allNativeEvents } from "./EventRegistry";
import { EventSystemFlags, IS_CAPTURE_PHASE } from "./EventSystemFlags";
import getEventTarget from "./getEventTarget";
import getListener from "./getListener";
import { AnyNativeEvent } from "./PluginModuleType";
import * as SimpleEventPlugin from "./plugins/SimpleEventPlugin";
import { createEventListenerWrapperWithPriority } from "./ReactDOMEventListener";

type DispatchListener = {
  instance: null | Fiber;
  listener: Function;
  currentTarget: EventTarget;
};

type DispatchEntry = {
  event: Object;
  listeners: Array<DispatchListener>;
};

export type DispatchQueue = Array<DispatchEntry>;

SimpleEventPlugin.registerEvents();

const listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);

/**
 * @description: 注册事件
 * @param domEventName 事件名
 * @param isCapturePhaseListener 是否是捕获阶段的监听器
 * @param target 目标元素
 */
function listenToNativeEvent(
  domEventName: DOMEventName,
  isCapturePhaseListener: boolean,
  target: EventTarget
) {
  let eventSystemFlags = 0;
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener
  );
}

function addTrappedEventListener(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  isCapturePhaseListener: boolean
) {
  let listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventSystemFlags
  );
  // 注册冒泡事件
  addEventBubbleListener(targetContainer, domEventName, listener);
}

/**
 * @description: 创建所有支持的事件监听，react18所有的事件监听都是绑定在app容器上的
 * @param {EventTarget} rootContainerElement
 */
export function listenToAllSupportedEvents(rootContainerElement: EventTarget) {
  if (!rootContainerElement[listeningMarker]) {
    allNativeEvents.forEach((domEventName) => {
      listenToNativeEvent(domEventName, false, rootContainerElement);
      // TODO 对于部分事件不能委托给容器，应该委托给实际目标元素，因为这些事件不会一直在dom上冒泡
    });
  }
}

export function dispatchEventForPluginEventSystem(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber,
  targetContainer: EventTarget
) {
  const ancestorInst = targetInst;
  batchedUpdates(() =>
    dispatchEventsForPlugins(
      domEventName,
      eventSystemFlags,
      nativeEvent,
      ancestorInst,
      targetContainer
    )
  );
}

function dispatchEventsForPlugins(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber,
  targetContainer: EventTarget
) {
  const nativeEventTarget = getEventTarget(nativeEvent);
  // 要触发的事件队列
  const dispatchQueue = [];
  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  );
}

function batchedUpdates(fn: () => void) {
  fn();
}

function extractEvents(
  dispatchQueue: DispatchQueue,
  domEventName: DOMEventName,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget
) {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  );
}

export function accumulateSinglePhaseListeners(
  targetFiber: Fiber | null,
  reactName: string | null,
  nativeEventType: string,
  inCapturePhase: boolean,
  accumulateTargetOnly: boolean,
  nativeEvent: AnyNativeEvent
) {
  const captureName = reactName !== null ? reactName + "Capture" : null;
  const reactEventName = inCapturePhase ? captureName : reactName;
  let listeners: Array<DispatchListener> = [];
  let instance = targetFiber;
  let lastHostComponent = null;

  // TODO 循环向上遍历节点，将有关的事件都添加到事件队列中
  while (instance !== null) {
    const { stateNode, tag } = instance;
    if (tag === HostComponent && stateNode !== null) {
      lastHostComponent = stateNode;
      if (reactEventName) {
        const listener = getListener(instance, reactEventName);
        if (listener != null) {
          listeners.push({
            instance,
            listener,
            currentTarget: lastHostComponent as any,
          });
        }
      }
    }
    instance = instance.return;
  }
  console.log(listeners);
  return listeners;
}

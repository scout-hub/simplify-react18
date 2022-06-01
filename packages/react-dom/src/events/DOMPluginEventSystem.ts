/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 13:53:51
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 14:52:40
 */
import { DOMEventName } from "./DOMEventNames";
import { allNativeEvents } from "./EventRegistry";
import { EventSystemFlags, IS_CAPTURE_PHASE } from "./EventSystemFlags";
import * as SimpleEventPlugin from "./plugins/SimpleEventPlugin";

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
) {}

/**
 * @description: 创建所有支持的事件监听，react18所有的事件监听都是绑定在app容器上的
 * @param {EventTarget} rootContainerElement
 */
export function listenToAllSupportedEvents(rootContainerElement: EventTarget) {
  if (!rootContainerElement[listeningMarker]) {
    allNativeEvents.forEach((domEventName) => {
      // TODO 对于部分事件不能委托给容器，应该委托给实际目标元素，因为这些事件不会一直在dom上冒泡
      listenToNativeEvent(domEventName, true, rootContainerElement);
    });
  }
}

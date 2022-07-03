/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 15:44:53
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 10:58:50
 */

import type { Fiber } from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler";
import { DOMEventName } from "../events/DOMEventNames";
import { getEventPriority } from "../events/ReactDOMEventListener";
import {
  createElement,
  diffProperties,
  setInitialProperties,
  updateProperties,
} from "./ReactDOMComponent";
import { precacheFiberNode, updateFiberProps } from "./ReactDOMComponentTree";

/**
 * 判断该节点的children是否可以直接作为文本子节点
 */
export function shouldSetTextContent(type, props) {
  return (
    type === "textarea" ||
    type === "noscript" ||
    typeof props.children === "string" ||
    typeof props.children === "number" ||
    (typeof props.dangerouslySetInnerHTML === "object" &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}

/**
 * @description: 创建fiber节点对应的真实dom
 * @param type 元素类型
 * @param props 元素属性
 */
export function createInstance(type, props, internalInstanceHandle: Fiber) {
  const domElement = createElement(type, props);
  // 在创建的dom元素上添加一个自定义的属性用于存储props
  updateFiberProps(domElement, props);
  // 在对应dom上绑定fiber节点，在事件处理中需要用dom获取fiber节点
  precacheFiberNode(internalInstanceHandle, domElement);
  return domElement;
}

export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props);
  return false;
}

/**
 * @description: insertBefore插入节点
 * @param container
 * @param child
 * @param beforeChild
 */
export function insertInContainerBefore(container, child, beforeChild) {
  container.insertBefore(child, beforeChild);
}

/**
 * @description: appendChild插入节点
 * @param container
 * @param child
 */
export function appendChildToContainer(container, child): void {
  container.appendChild(child);
}

/**
 * @description: 创建文本节点
 * @param {string} text
 */
export function createTextInstance(text: string) {
  const instance = document.createTextNode(text);
  return instance;
}

/**
 * @description: 添加子节点
 * @param parentInstance
 * @param child
 */
export function appendInitialChild(parentInstance, child): void {
  parentInstance.appendChild(child);
}

/**
 * @description: 获取事件的优先级
 */
export function getCurrentEventPriority() {
  const currentEvent = window.event;
  if (currentEvent === void 0) {
    return DefaultEventPriority;
  }
  return getEventPriority(currentEvent.type as DOMEventName);
}

// 是否支持Promise
const localPromise = typeof Promise === "function" ? Promise : void 0;

// 是否支持setTimeout
const scheduleTimeout: any =
  typeof setTimeout === "function" ? setTimeout : undefined;

// 执行微任务的函数
export const scheduleMicrotask =
  typeof queueMicrotask === "function"
    ? queueMicrotask
    : localPromise !== void 0
    ? (callback) => localPromise.resolve(null).then(callback)
    : scheduleTimeout;

/**
 * @description: 属性更新
 */
export function prepareUpdate(
  domElement: Element,
  type: string,
  oldProps: any,
  newProps: any
) {
  return diffProperties(domElement, type, oldProps, newProps);
}

/**
 * @description: 提交dom的更新
 */
export function commitUpdate(
  domElement: Element,
  updatePayload: Array<any>,
  type: string,
  oldProps: any,
  newProps: any
): void {
  updateProperties(domElement, updatePayload, type, oldProps, newProps);
  updateFiberProps(domElement, newProps);
}

/**
 * @description: 提交文本更新
 */
export function commitTextUpdate(textInstance: Element, newText: string) {
  textInstance.nodeValue = newText;
}

/**
 * @description: 删除节点
 */
export function removeChild(parentInstance: Element, child: Element) {
  parentInstance.removeChild(child);
}

/**
 * @description: 插入节点
 */
export function insertBefore(
  parentInstance: Element,
  child: Element,
  beforeChild: Element
): void {
  parentInstance.insertBefore(child, beforeChild);
}

/**
 * @description: 添加节点
 */
export function appendChild(parentInstance: Element, child: Element): void {
  parentInstance.appendChild(child);
}

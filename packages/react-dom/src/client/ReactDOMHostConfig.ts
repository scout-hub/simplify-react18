/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 15:44:53
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-14 12:47:21
 */

import { DefaultEventPriority } from "packages/react-reconciler/src/ReactEventPriorities";
import { Fiber } from "packages/react-reconciler/src/ReactInternalTypes";
import { DOMEventName } from "../events/DOMEventNames";
import { getEventPriority } from "../events/ReactDOMEventListener";
import { createElement, setInitialProperties } from "./ReactDOMComponent";
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
  if (currentEvent === undefined) {
    return DefaultEventPriority;
  }
  return getEventPriority(currentEvent.type as DOMEventName);
}

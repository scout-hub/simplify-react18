/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 15:44:53
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-28 19:57:25
 */

import { createElement, setInitialProperties } from "./ReactDOMComponent";
import { updateFiberProps } from "./ReactDOMComponentTree";

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
export function createInstance(type, props) {
  const domElement = createElement(type, props);
  // 在创建的dom元素上添加一个自定义的属性用于存储props
  updateFiberProps(domElement, props);
  return domElement;
}

export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props);
}

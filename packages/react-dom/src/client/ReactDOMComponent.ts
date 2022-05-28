/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:36:13
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-28 20:30:31
 */

import { isString } from "packages/shared/src";
import setTextContent from "./setTextContent";

const CHILDREN = "children";

/**
 * @description: 创建元素
 * @param type 元素类型
 * @param props 元素属性
 */
export function createElement(type, props) {
  const domElement = document.createElement(type);
  return domElement;
}

/**
 * @description: 为dom添加属性
 * @param domElement
 * @param tag
 * @param rawProps
 */
export function setInitialProperties(domElement, tag, rawProps) {
  let props = rawProps;
  setInitialDOMProperties(tag, domElement, props);
}

function setInitialDOMProperties(tag, domElement, nextProps) {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    const nextProp = nextProps[propKey];
    if (propKey === CHILDREN) {
      // 文本子节点
      const value = isString(nextProp) ? nextProp : "" + nextProp;
      setTextContent(domElement, value);
    } else if (nextProp != null) {
      // TODO 设置属性
    }
  }
}

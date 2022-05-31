/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:36:13
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 15:39:34
 */

import { isNumber, isString } from "packages/shared/src";
import { setValueForProperty } from "./DOMPropertyOperations";
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
      // 处理文本子节点，当nextProp是字符串或者数字时表示唯一文本子节点
      if (isString(nextProp)) {
        setTextContent(domElement, nextProp);
      } else if (isNumber(nextProp)) {
        const value = "" + nextProp;
        setTextContent(domElement, value);
      }
    } else if (nextProp != null) {
      // 设置其他属性
      setValueForProperty(domElement, propKey, nextProp);
    }
  }
}

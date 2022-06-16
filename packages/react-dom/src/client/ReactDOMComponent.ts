/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:36:13
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-16 22:17:58
 */

import { isFunction, isNumber, isString } from "packages/shared/src";
import {
  setValueForProperty,
  setValueForStyles,
} from "./DOMPropertyOperations";
import setTextContent from "./setTextContent";

const CHILDREN = "children";
const STYLE = "style";

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
    if (propKey === STYLE) {
      // 处理style
      setValueForStyles(domElement, nextProp);
    } else if (propKey === CHILDREN) {
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

/**
 * @description: 找出变化的属性进行更新
 */
export function diffProperties(
  domElement: Element,
  tag: string,
  lastRawProps: any,
  nextRawProps: any
) {
  let updatePayload: null | Array<any> = null;

  let lastProps: any;
  let nextProps: any;
  switch (tag) {
    case "input":
      throw Error("diffProperties input");
      break;
    default: {
      lastProps = lastRawProps;
      nextProps = nextRawProps;
    }
  }

  let propKey;
  let styleName;
  let styleUpdates: Record<string, any> | null = null;

  // 第一个循环处理属性的删除
  for (propKey in lastProps) {
    // 如果新的属性存在或者该属性不是lastProps自身的属性或者lastProps[propKey]值是null的话就跳过
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue;
    }
    // 剩下的情况都是属性需要被删除的处理

    //  处理style属性
    if (propKey === STYLE) {
      throw Error("diffProperties STYLE");
    } else if (propKey === CHILDREN) {
    } else {
      // 添加需要删除的属性
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }

  // 第二个循环处理属性的新增和更新
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    const lastProp = lastProps != null ? lastProps[propKey] : undefined;
    // 属性不是自身的属性 ｜ 新旧属性值一样 ｜ 新旧属性值是null/undefined，跳过
    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    ) {
      continue;
    }
    if (propKey === STYLE) {
      throw Error("diffProperties STYLE");
    } else if (propKey === CHILDREN) {
      if (isString(nextProp) || isNumber(nextProp)) {
        (updatePayload = updatePayload || []).push(propKey, "" + nextProp);
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }

  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
}

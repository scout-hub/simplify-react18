/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:36:13
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-26 14:21:23
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
      // throw Error("diffProperties input");
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
    // 如果新的属性中存在或者该属性不是lastProps自身的属性或者lastProps[propKey]值是null的话就跳过
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
      const lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }
          // 将lastStyle上的style属性都清空
          styleUpdates[styleName] = "";
        }
      }
    } else if (propKey === CHILDREN) {
      throw Error("diffProperties children");
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
      // 如果老的style也存在
      if (lastProp) {
        for (styleName in lastProp) {
          // 如果老的存在，新的不存在，则把当前的style属性值设置为空
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = "";
          }
        }
        // 如果老的style属性值和新的style对应的属性值不一样，则更新属性值
        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        // 老的整个style对象不存在，则直接用nextProp
        styleUpdates = nextProp;
      }
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

/**
 * @description: 更新dom属性
 */
export function updateProperties(
  domElement: Element,
  updatePayload: Array<any>,
  tag: string,
  lastRawProps: any,
  nextRawProps: any
) {
  updateDOMProperties(domElement, updatePayload);
}

/**
 * @description: 更新dom属性
 */
function updateDOMProperties(domElement: Element, updatePayload: Array<any>) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue);
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {
      setValueForProperty(domElement, propKey, propValue);
    }
  }
}

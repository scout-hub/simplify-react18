/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 15:38:38
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 16:42:51
 */
import dangerousStyleValue from "../shared/dangerousStyleValue";
import { getPropertyInfo, shouldIgnoreAttribute } from "../shared/DOMProperty";

/**
 * @description: 设置属性
 * @param {Element} node
 * @param {string} name
 * @param value
 */
export function setValueForProperty(node: Element, name: string, value) {
  const attributeName = getPropertyInfo(name);
  // 一些属性是react中定义的，这些属性是不能直接在dom上设置
  if (shouldIgnoreAttribute(attributeName)) {
    return;
  }
  // TODO处理事件属性

  // TODO属性值的处理
  node.setAttribute(attributeName, value);
}

/**
 * @description: 设置style属性
 * @param  node
 * @param  styles
 */
export function setValueForStyles(node, styles) {
  const style = node.style;
  for (const styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue;
    }
    const styleValue = dangerousStyleValue(styleName, styles[styleName]);
    style[styleName] = styleValue;
  }
}

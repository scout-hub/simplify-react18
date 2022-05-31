/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:39:14
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 16:41:55
 */
import { isUnitlessNumber } from "./CSSProperty";

/**
 * @description: 处理style属性值
 * @param name
 * @param value
 */
export default function dangerousStyleValue(name, value) {
  const isEmpty = value == null || typeof value === "boolean" || value === "";
  if (isEmpty) {
    return "";
  }
  // 处理需要加单位的属性
  if (
    typeof value === "number" &&
    value !== 0 &&
    !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])
  ) {
    return value + "px";
  }
  
  return ("" + value).trim();
}

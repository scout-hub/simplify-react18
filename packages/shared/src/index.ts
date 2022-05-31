/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 09:45:14
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 17:18:59
 */
export const assign = Object.assign;

export const isObject = (val: unknown) =>
  val !== null && typeof val === "object";

export const isString = (val: unknown) => typeof val === "string";
export const isNumber = (val: unknown) => typeof val === "number";
export const isFunction = (val: unknown) => typeof val === "function";

export const isArray = Array.isArray;

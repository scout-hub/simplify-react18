/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 09:45:14
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-30 17:35:13
 */
export const assign = Object.assign;

export const isObject = (val: unknown) =>
  val !== null && typeof val === "object";

export const isString = (val: unknown) => typeof val === "string";
export const isNumber = (val: unknown) => typeof val === "number";

export const isArray = Array.isArray;

/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 09:45:14
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-28 15:36:21
 */
export const assign = Object.assign;

export const isObject = (val: unknown) =>
  val !== null && typeof val === "object";

export const isString = (val: unknown) => typeof val === "string";
export const isNumber = (val: unknown) => typeof val === "number";
export const isFunction = (val: unknown) => typeof val === "function";

export const isArray = Array.isArray;
export const is = Object.is;

export const hasOwnProperty = Object.prototype.hasOwnProperty;
export const shallowEqual = (prevObj: any, nextObj: any): boolean => {
  if (is(prevObj, nextObj)) return true;
  if (!isObject(prevObj) || !isObject(nextObj)) return false;

  const prevObjKeys = Object.keys(prevObj);
  const nextObjKeys = Object.keys(nextObj);

  if (prevObjKeys.length !== nextObjKeys.length) return false;

  for (let i = 0; i < prevObjKeys.length; i++) {
    const key = prevObjKeys[i];
    if (!hasOwnProperty.call(nextObj, key) || !is(prevObj[key], nextObj[key]))
      return false;
  }

  return true;
};

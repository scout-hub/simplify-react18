/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 09:45:14
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-27 09:45:22
 */
export const assign = Object.assign;

export const isObject = (val: unknown) =>
  val !== null && typeof val === "object";

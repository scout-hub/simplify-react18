/*
 * @Author: Zhouqi
 * @Date: 2022-07-06 15:07:35
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-06 17:14:03
 */
import { isFunction, REACT_KEEP_ALIVE_TYPE } from "shared";

export const createKeepAlive = (rendercallback) => {
  let children: any = null;
  if (isFunction(rendercallback)) {
    children = rendercallback();
  }

  // 每次显示的只能有一个组件
  if (children && children.length > 1) {
    console.error("KeepAlive组件内部只允许有一个子组件");
    children = children[0];
  }
  // 隐藏容器
  const storageContainer = document.createElement("div");
  const cache = new Map();
  const keys = new Set();

  return {
    $$typeof: REACT_KEEP_ALIVE_TYPE,
    storageContainer,
    cache,
    keys,
    children,
  };
};

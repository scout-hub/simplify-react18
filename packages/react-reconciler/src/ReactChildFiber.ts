/*
 * @Author: Zhouqi
 * @Date: 2022-05-26 17:20:37
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-27 10:23:04
 */

import { isObject } from "packages/shared/src";
import { REACT_ELEMENT_TYPE } from "packages/shared/src/ReactSymbols";
import { createFiberFromElement } from "./ReactFiber";

/**
 * @description: diff更新入口
 */
export function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
  if (isObject(newChild)) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        return reconcileSingleElement(returnFiber, currentFirstChild, newChild);
    }
  }
}

/**
 * @description: diff单个节点
 * @param returnFiber
 * @param currentFirstChild
 * @param newChild
 */
function reconcileSingleElement(returnFiber, currentFirstChild, element) {
  let child = currentFirstChild;
  // TODO 老的节点存在情况根据type和key进行节点的复用
  while (child !== null) {}
  // 没有节点复用（比如首屏渲染的hostRoot的current是没有child节点的）
  // 直接创建fiber节点
  const created = createFiberFromElement(element);
  console.log(created);
}

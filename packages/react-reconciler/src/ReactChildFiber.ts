/*
 * @Author: Zhouqi
 * @Date: 2022-05-26 17:20:37
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-27 14:00:35
 */

import { isObject } from "packages/shared/src";
import { REACT_ELEMENT_TYPE } from "packages/shared/src/ReactSymbols";
import { createFiberFromElement } from "./ReactFiber";
import { Placement } from "./ReactFiberFlags";

/**
 * @description: 创建diff的函数
 * @param shouldTrackSideEffects 是否需要追踪副作用
 */
function ChildReconciler(shouldTrackSideEffects) {
  /**
   * @description: diff的入口
   */
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (isObject(newChild)) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          );
      }
    }
    return null;
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
    created.return = returnFiber;
    return created;
  }

  function placeSingleChild(newFiber) {
    // 首次渲染时的hostRoot节点会进入到这个条件
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.flags |= Placement;
    }
    return newFiber;
  }

  return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);

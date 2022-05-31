/*
 * @Author: Zhouqi
 * @Date: 2022-05-26 17:20:37
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 11:56:12
 */

import { isArray, isNumber, isObject, isString } from "packages/shared/src";
import { REACT_ELEMENT_TYPE } from "packages/shared/src/ReactSymbols";
import { createFiberFromElement, createFiberFromText } from "./ReactFiber";
import { Placement } from "./ReactFiberFlags";
import type { Fiber } from "./ReactInternalTypes";

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
      // 处理单个子节点的情况
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          );
      }
      // 处理多个子节点的情况
      if (isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
      }
    }
    return null;
  }

  /**
   * @description: 处理子节点，diff的实现
   */
  function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<any>
  ) {
    let oldFiber = currentFirstChild;
    let newIndex = 0;
    let previousNewFiber: Fiber | null = null;
    let resultingFirstChild: Fiber | null = null;

    if (oldFiber === null) {
      for (; newIndex < newChildren.length; newIndex++) {
        const newFiber = createChild(returnFiber, newChildren[newIndex]);
        // 前一个fiber是null说明当前这个newFiber就是要返回的第一个子fiber
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          // 否则把当前的newFiber挂载到前一个fiber的sibling上
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }

    return null;
  }

  /**
   * @description: 创建子fiber节点
   * @param {Fiber} returnFiber
   * @param {any} newChild
   */
  function createChild(returnFiber: Fiber, newChild: any) {
    // 处理文本子节点
    if ((isString(newChild) && newChild !== "") || isNumber(newChild)) {
      const created = createFiberFromText(newChild);
      created.return = returnFiber;
      return created;
    }

    if (isObject(newChild)) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const created: Fiber = createFiberFromElement(newChild);
          created.return = returnFiber;
          return created;
        }
      }

      // todo children
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
export const mountChildFibers = ChildReconciler(false);

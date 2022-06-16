/*
 * @Author: Zhouqi
 * @Date: 2022-05-26 17:20:37
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-16 15:31:42
 */
import type { Lanes } from "./ReactFiberLane";
import type { Fiber } from "./ReactInternalTypes";
import { isArray, isNumber, isObject, isString } from "packages/shared/src";
import { REACT_ELEMENT_TYPE } from "packages/shared/src/ReactSymbols";
import {
  createFiberFromElement,
  createFiberFromText,
  createWorkInProgress,
} from "./ReactFiber";
import { ChildDeletion, Placement } from "./ReactFiberFlags";

/**
 * @description: 创建diff的函数
 * @param shouldTrackSideEffects 是否需要追踪副作用
 */
function ChildReconciler(shouldTrackSideEffects) {
  /**
   * @description: diff的入口
   */
  function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    lanes: Lanes
  ) {
    if (isObject(newChild)) {
      // 处理单个子节点的情况
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            )
          );
      }
      // 处理多个子节点的情况
      if (isArray(newChild)) {
        return reconcileChildrenArray(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
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
    newChildren: Array<any>,
    lanes: Lanes
  ): Fiber | null {
    let oldFiber = currentFirstChild;
    let newIndex = 0;
    let lastPlacedIndex = 0;
    let nextOldFiber = null;
    const childrenLength = newChildren.length;

    let previousNewFiber: Fiber | null = null;
    let resultingFirstChild: Fiber | null = null;

    // diff
    for (; oldFiber !== null && newIndex < childrenLength; newIndex++) {}

    // old fiber不存在，表示需要创建新的fiber
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
   */
  function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: any,
    lanes: Lanes
  ) {
    const key = element.key;
    let child = currentFirstChild;
    // 老的节点存在情况根据type和key进行节点的复用
    while (child !== null) {
      // key相同，可能可以复用，接下去判断type
      if (child.key === key) {
        const elementType = element.type;
        if (child.elementType === elementType) {
          // 这里是single elment的处理，也就是只有一个子节点，所以如果存在兄弟节点，需要全部删除
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        }
        // type不同，删除下面所有的子节点
        deleteRemainingChildren(returnFiber, child);
        break;
      } else {
        // key不同，直接删除
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
    // 没有节点复用（比如首屏渲染的hostRoot的current是没有child节点的）
    // 直接创建fiber节点
    const created: Fiber = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }

  /**
   * @description: 创建当前fiber的workInProgress
   */
  function useFiber(fiber: Fiber, pendingProps: any): Fiber {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  /**
   * @description: 给需要删除的节点加上标记并添加到父节点的deletions上
   */
  function deleteChild(returnFiber: Fiber, childToDelete: Fiber) {
    const deletions = returnFiber.deletions;
    // 如果deletions不存在，则创建一个[]
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      // 添加需要删除的fiber
      deletions.push(childToDelete);
    }
  }

  /**
   * @description: 删除子节点
   */
  function deleteRemainingChildren(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null
  ) {
    let childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  }

  function placeSingleChild(newFiber: Fiber): Fiber {
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

/**
 * @description: 克隆子fiber节点
 */
export function cloneChildFibers(current: Fiber | null, workInProgress: Fiber) {
  let currentChild = workInProgress.child;
  // 没有子节点了，直接退出
  if (currentChild === null) {
    return;
  }
  let newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
  newChild.return = workInProgress;
  // 为currentChild的兄弟fiber创建workInProgress
  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(
      currentChild,
      currentChild.pendingProps
    );
    newChild.return = workInProgress;
  }
  // 最后一个child的sisbling没有了，为null
  newChild.sibling = null;
}

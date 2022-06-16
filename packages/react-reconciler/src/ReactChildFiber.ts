/*
 * @Author: Zhouqi
 * @Date: 2022-05-26 17:20:37
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-16 17:08:17
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
import { HostText } from "./ReactWorkTags";

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
    let nextOldFiber: Fiber | null = null;
    const childrenLength = newChildren.length;

    let previousNewFiber: Fiber | null = null;
    let resultingFirstChild: Fiber | null = null;

    /**
     * diff的情况存在以下一种或多种:
     * 1、节点更新 即发生属性的变化
     * 2、节点新增或减少
     * 3、节点位置变化
     *
     * 由于fiber数据结构是个链表，因此不能进行首尾双指针的遍历
     * 并且react发现香蕉鱼新增和删除节点，更新节点的频率是比较高的
     * 因此，在处理的优先级上以更新作为高优先级的操作。
     * 基于上述原因，diff的时候需要做两次循环，一次遍历节点更新的情况，第二次遍历不是更新的情况
     */

    // 第一轮处理节点更新的情况
    for (; oldFiber !== null && newIndex < childrenLength; newIndex++) {
      if (oldFiber.index > newIndex) {
        throw new Error("这是哪种情况？？？");
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIndex],
        lanes
      );
      console.log(newFiber);
    }

    // old fiber不存在，表示需要创建新的fiber
    if (oldFiber === null) {
      for (; newIndex < newChildren.length; newIndex++) {
        const newFiber = createChild(returnFiber, newChildren[newIndex], lanes);
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
   * @description: 新旧fiber能否匹配，不能的话返回null，可以的话就更新fiber
   */
  function updateSlot(
    returnFiber: Fiber,
    oldFiber: Fiber | null,
    newChild: any,
    lanes: Lanes
  ): Fiber | null {
    const key = oldFiber !== null ? oldFiber.key : null;
    // 新节点是文本节点的情况，文本节点没有key
    if ((isString(newChild) && newChild !== "") || isNumber(newChild)) {
      // 老fiber有key，说明老fiber不是文本节点，这里直接返回null
      if (key !== null) {
        return null;
      }
      /**
       * 更新老文本节点
       *
       * key为null的情况有两种，第一种是老节点就是null（不存在），第二种是老节点就是文本节点
       * 或者老节点的key就是null（存在）
       * updateTextNode的时候会判断上述情况
       */
      return updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
    }

    // newChild是对象的情况
    if (isObject(newChild)) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            return updateElement(returnFiber, oldFiber, newChild, lanes);
          } else {
            return null;
          }
        }
      }

      // newChild是数组的情况
      if (isArray(newChild)) {
        throw Error("updateSlot newChild is Array");
      }
    }

    return null;
  }

  /**
   * @description: 更新元素
   */
  function updateElement(
    returnFiber: Fiber,
    current: Fiber | null,
    element: any,
    lanes: Lanes
  ): Fiber {
    const elementType = element.type;
    // 老节点存在且type相同就复用，否则就创建新的fiber
    if (current !== null) {
      if (current.elementType === elementType) {
        const existing = useFiber(current, element.props);
        existing.return = returnFiber;
        return existing;
      }
    }
    const created = createFiberFromElement(element, lanes);
    created.return = returnFiber;
    return created;
  }

  /**
   * @description: 更新文本节点
   */
  function updateTextNode(
    returnFiber: Fiber,
    current: Fiber | null,
    textContent: string,
    lanes: Lanes
  ) {
    // 老节点不存在或者老节点不是文本节点，添加文本节点
    if (current === null || current.tag !== HostText) {
      const created = createFiberFromText(textContent, lanes);
      created.return = returnFiber;
      return created;
    } else {
      // 老节点是文本节点，更新文本节点
      const existing = useFiber(current, textContent);
      existing.return = returnFiber;
      return existing;
    }
  }

  /**
   * @description: 创建子fiber节点
   */
  function createChild(returnFiber: Fiber, newChild: any, lanes: Lanes) {
    // 处理文本子节点
    if ((isString(newChild) && newChild !== "") || isNumber(newChild)) {
      const created = createFiberFromText(newChild, lanes);
      created.return = returnFiber;
      return created;
    }

    if (isObject(newChild)) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const created: Fiber = createFiberFromElement(newChild, lanes);
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
  ): Fiber {
    const key = element.key;
    let child = currentFirstChild;
    // 老的节点存在情况根据type和key进行节点的复用
    while (child !== null) {
      // key相同，可能可以复用，接下去判断type
      if (child.key === key) {
        const elementType = element.type;
        if (child.elementType === elementType) {
          // 这里是single elment的处理，也就是只有一个子节点，所以后面的兄弟节点可以全部删除
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        }
        /**
         * type不同，删除子节点及其兄弟节点，这里可以直接删除兄弟节点的原因：
         * 注意一个前提条件child.key === key，也就是说当前这个子节点的key已经匹配了新节点的key，
         * 意味着剩下的兄弟节点不可能再与这个新节点匹配了，所以剩下的兄弟节点也可以删除了。
         */
        deleteRemainingChildren(returnFiber, child);
        break;
      } else {
        /**
         * key不同，直接删除当前这个子节点，这里不需要删除兄弟节点的原因：
         * 前提条件key就不相同，那意味着后面的兄弟有机会去匹配这个新节点
         */
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
    // 没有节点复用（比如首屏渲染的hostRoot的current是没有child节点的）
    // 直接创建fiber节点
    const created: Fiber = createFiberFromElement(element, lanes);
    created.return = returnFiber;
    return created;
  }

  /**
   * @description: 复用fiber
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

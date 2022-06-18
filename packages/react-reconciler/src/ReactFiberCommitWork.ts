/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 21:24:22
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-18 16:50:37
 */
import type { Fiber, FiberRoot } from "./ReactInternalTypes";
import {
  appendChildToContainer,
  commitTextUpdate,
  commitUpdate,
  insertInContainerBefore,
} from "packages/react-dom/src/client/ReactDOMHostConfig";
import { MutationMask, Placement, Update } from "./ReactFiberFlags";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./ReactWorkTags";

/**
 * @description: commitMutation阶段
 */
export function commitMutationEffects(root: FiberRoot, finishedWork: Fiber) {
  commitMutationEffectsOnFiber(finishedWork, root);
}

/**
 * @description: 提交副作用处理
 */
function commitMutationEffectsOnFiber(finishedWork: Fiber, root: FiberRoot) {
  const current = finishedWork.alternate!;
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      return;
    }
    case HostComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      // 处理节点更新
      if (flags & Update) {
        const instance: Element = finishedWork.stateNode;
        if (instance == null) return;
        const newProps = finishedWork.memoizedProps;
        const oldProps = current.memoizedProps;
        const type = finishedWork.type;
        const updatePayload = finishedWork.updateQueue;
        finishedWork.updateQueue = null;
        if (updatePayload == null) return;
        commitUpdate(instance, updatePayload, type, oldProps, newProps);
      }
      return;
    }
    case HostRoot:
      recursivelyTraverseMutationEffects(root, finishedWork);
      // commitReconciliationEffects(finishedWork);
      return;
    case HostText: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      if (flags & Update) {
        const textInstance: Element = finishedWork.stateNode;
        const newText: string = finishedWork.memoizedProps;
        commitTextUpdate(textInstance, newText);
      }
      return;
    }
  }
}

/**
 * @description: 处理子fiber节点的副作用
 */
function recursivelyTraverseMutationEffects(
  root: FiberRoot,
  parentFiber: Fiber
) {
  const deletions = parentFiber.deletions;
  // 删除节点
  if (deletions !== null) {
    throw Error("recursivelyTraverseMutationEffects commitDeletionEffects");
  }
  // 子节点需要更新
  if (parentFiber.subtreeFlags & MutationMask) {
    let child = parentFiber.child;
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root);
      child = child.sibling;
    }
  }
}

/**
 * @description: 提交副作用处理
 */
function commitReconciliationEffects(finishedWork: Fiber) {
  const flags = finishedWork.flags;
  if (flags & Placement) {
    commitPlacement(finishedWork);
    // 删除Placement标记
    finishedWork.flags &= ~Placement;
  }
}

function commitPlacement(finishedWork) {
  // 找到host节点
  const parentFiber = getHostParentFiber(finishedWork);
  switch (parentFiber.tag) {
    case HostRoot: {
      // 获取父级Fiber节点，因为插入情况可能有两种，一种是parent.appendChild，另外一种是insertBefore
      // 针对两种方法的插入，对应的锚点节点是不同的
      const parent = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break;
    }
  }
}

/**
 * @description: 插入dom
 * @param node
 * @param before
 * @param parent
 */
function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  const tag = node.tag;
  const isHost = tag === HostComponent || tag === HostText;

  if (isHost) {
    const stateNode = node.stateNode;
    // 存在before节点的情况下使用insertBefore，否则用appednChild
    before
      ? insertInContainerBefore(parent, stateNode, before)
      : appendChildToContainer(parent, stateNode);
  } else {
    let child = node.child;

    if (child !== null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent);
      // 处理兄弟节点
      let sibling = child.sibling;

      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

function getHostParentFiber(fiber) {
  let parent = fiber.return;
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
}

const isHostParent = (fiber): boolean =>
  fiber.tag === HostComponent || fiber.tag === HostRoot;

/**
 * 找到fiber节点的兄弟fiber且这个fiber不需要插入真实dom
 * @param fiber 从该节点开始往右边找
 * @returns 找到的dom节点
 */
const getHostSibling = (fiber): Element | null => {
  let node = fiber;

  siblings: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) return null;
      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;

    while (node.tag !== HostComponent) {
      if (node.flags & Placement) {
        continue siblings;
      }

      if (node.child === null) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }

    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
  }
};

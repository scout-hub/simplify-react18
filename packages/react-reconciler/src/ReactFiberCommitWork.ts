/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 21:24:22
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-19 14:21:56
 */
import type { Fiber, FiberRoot } from "./ReactInternalTypes";
import {
  appendChild,
  appendChildToContainer,
  commitTextUpdate,
  commitUpdate,
  insertBefore,
  insertInContainerBefore,
  removeChild,
} from "packages/react-dom/src/client/ReactDOMHostConfig";
import { MutationMask, Placement, Update } from "./ReactFiberFlags";
import {
  ClassComponent,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./ReactWorkTags";

let hostParent: Element | null = null;

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
    case ClassComponent: {
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
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i];
      commitDeletionEffects(root, parentFiber, childToDelete);
    }
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
 * @description: 提交删除副作用
 */
function commitDeletionEffects(
  root: FiberRoot,
  returnFiber: Fiber,
  deletedFiber: Fiber
) {
  let parent: Fiber | null = returnFiber;
  // 找到当前需要删除节点的父节点dom
  findParent: while (parent !== null) {
    switch (parent.tag) {
      case HostComponent: {
        hostParent = parent.stateNode;
        break findParent;
      }
      case HostRoot: {
        hostParent = parent.stateNode.containerInfo;
        break findParent;
      }
    }
    parent = parent.return;
  }
  if (hostParent === null) {
    throw Error("hostParent is null");
  }
  commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
  hostParent = null;
  detachFiberMutation(deletedFiber);
}

function detachFiberMutation(fiber: Fiber) {
  // 切断与父fiber的联系
  const alternate = fiber.alternate;
  if (alternate !== null) {
    alternate.return = null;
  }
  fiber.return = null;
}

function commitDeletionEffectsOnFiber(
  finishedRoot: FiberRoot,
  nearestMountedAncestor: Fiber,
  deletedFiber: Fiber
) {
  switch (deletedFiber.tag) {
    case HostComponent:
    case HostText: {
      const prevHostParent = hostParent;
      hostParent = null;
      // deletedFiber如果存在子节点，则需要将其子节点全部删除
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      hostParent = prevHostParent;
      if (hostParent !== null) {
        removeChild(hostParent, deletedFiber.stateNode);
      } else {
        throw Error("commitDeletionEffectsOnFiber：hostParent is null");
      }
      return;
    }
    default:
      break;
  }
}

/**
 * @description: 删除当前节点的子节点
 */
function recursivelyTraverseDeletionEffects(
  finishedRoot,
  nearestMountedAncestor,
  parent
) {
  let child = parent.child;
  while (child !== null) {
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
    child = child.sibling;
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
    case HostComponent: {
      const parent = parentFiber.stateNode;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    }
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

function insertOrAppendPlacementNode(
  node: Fiber,
  before: Element | null,
  parent: Element
) {
  const tag = node.tag;
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost) {
    const stateNode = node.stateNode;
    before
      ? insertBefore(parent, stateNode, before)
      : appendChild(parent, stateNode);
  } else {
    const child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent);
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

/**
 * @description: 插入dom
 */
function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  const tag = node.tag;
  const isHost = tag === HostComponent || tag === HostText;
  console.log(node);

  if (isHost) {
    const stateNode = node.stateNode;
    // 存在before节点的情况下使用insertBefore，否则用appednChild
    before
      ? insertInContainerBefore(parent, stateNode, before)
      : appendChildToContainer(parent, stateNode);
  } else {
    // 处理非普通元素和文本节点，例如function component需要插入的节点是它的子节点
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
 * @description 找到fiber节点的兄弟fiber且这个fiber不需要插入真实dom
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

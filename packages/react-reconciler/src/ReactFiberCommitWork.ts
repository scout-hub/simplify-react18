/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 21:24:22
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 11:08:25
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
} from "simplify-react-dom";
import {
  BeforeMutationMask,
  ChildDeletion,
  LayoutMask,
  MutationMask,
  NoFlags,
  Passive,
  PassiveMask,
  Placement,
  Snapshot,
  Update,
} from "./ReactFiberFlags";
import {
  ClassComponent,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./ReactWorkTags";
import { HookFlags } from "./ReactHookEffectTags";
import {
  HasEffect as HookHasEffect,
  Passive as HookPassive,
  Layout as HookLayout,
  Insertion as HookInsertion,
} from "./ReactHookEffectTags";
import { FunctionComponentUpdateQueue } from "./ReactFiberHooks";
import { commitUpdateQueue } from "./ReactUpdateQueue";

let hostParent: Element | null = null;

let nextEffect: Fiber | null = null;

export function commitPassiveMountEffects(
  root: FiberRoot,
  finishedWork: Fiber
) {
  nextEffect = finishedWork;
  commitPassiveMountEffects_begin(finishedWork, root);
}

function commitPassiveMountEffects_begin(subtreeRoot: Fiber, root: FiberRoot) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    const firstChild = fiber.child;
    // 找到第一个subtreeFlags中不存在PassiveMask副作用标记的节点
    if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && firstChild !== null) {
      firstChild.return = fiber;
      nextEffect = firstChild;
    } else {
      commitPassiveMountEffects_complete(subtreeRoot, root);
    }
  }
}

function commitPassiveMountEffects_complete(
  subtreeRoot: Fiber,
  root: FiberRoot
) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    // 如果当前fiber存在Passive副作用标记，则去处理副作用
    if ((fiber.flags & Passive) !== NoFlags) {
      try {
        commitPassiveMountOnFiber(root, fiber);
      } catch (error: any) {
        throw Error(error);
      }
    }

    // 处理完了
    if (fiber === subtreeRoot) {
      nextEffect = null;
      return;
    }

    // 处理兄弟节点的副作用
    const sibling = fiber.sibling;
    if (sibling !== null) {
      sibling.return = fiber.return;
      nextEffect = sibling;
      return;
    }

    // 处理父fiber的副作用
    nextEffect = fiber.return;
  }
}

/**
 * @description: 提交副作用处理
 */
function commitPassiveMountOnFiber(
  finishedRoot: FiberRoot,
  finishedWork: Fiber
) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      commitHookEffectListMount(HookPassive | HookHasEffect, finishedWork);
      break;
    }
    case HostRoot: {
      throw Error("HostRoot");
    }
  }
}

function commitHookEffectListMount(flags: HookFlags, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null =
    finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) === flags) {
        // 取出传入的副作用函数
        const create = effect.create;
        // destory就是用户传入的副作用函数中的返回值，这个返回值就是销毁函数
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
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
      if (flags & Update) {
        // 下次layout之前，执行上一个layoutEffect的销毁函数
        commitHookEffectListUnmount(
          HookInsertion | HookHasEffect,
          finishedWork
        );
        // HookInsertion暂未实现
        commitHookEffectListMount(HookInsertion | HookHasEffect, finishedWork);
      }
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
    default: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);

      return;
    }
  }
}

/**
 * @description: 提交layout阶段的副作用处理
 */
export function commitLayoutEffects(
  finishedWork: Fiber,
  root: FiberRoot
): void {
  nextEffect = finishedWork;
  commitLayoutEffects_begin(finishedWork, root);
}

function commitLayoutEffects_begin(subtreeRoot: Fiber, root: FiberRoot) {
  while (nextEffect !== null) {
    let fiber = nextEffect;
    let firstChild = fiber.child;
    // 找到第一个subtreeFlags中不存在LayoutMask副作用标记的节点
    if ((fiber.subtreeFlags & LayoutMask) !== NoFlags && firstChild !== null) {
      firstChild.return = fiber;
      nextEffect = firstChild;
    } else {
      commitLayoutMountEffects_complete(subtreeRoot, root);
    }
  }
}

function commitLayoutMountEffects_complete(
  subtreeRoot: Fiber,
  root: FiberRoot
) {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    if ((fiber.flags & LayoutMask) !== NoFlags) {
      try {
        commitLayoutEffectOnFiber(root, fiber.alternate, fiber);
      } catch (error: any) {
        throw Error(error);
      }
    }

    if (fiber === subtreeRoot) {
      nextEffect = null;
      return;
    }

    // 处理兄弟节点
    const sibling = fiber.sibling;
    if (sibling !== null) {
      sibling.return = fiber.return;
      nextEffect = sibling;
      return;
    }
    // 处理父节点
    nextEffect = fiber.return;
  }
}

function commitLayoutEffectOnFiber(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber
) {
  if ((finishedWork.flags & LayoutMask) !== NoFlags) {
    switch (finishedWork.tag) {
      case FunctionComponent: {
        commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
        break;
      }
      case ClassComponent: {
        // 获取组件实例
        const instance = finishedWork.stateNode;
        if (finishedWork.flags & Update) {
          if (current === null) {
            // mount阶段执行componentDidMount
            instance.componentDidMount();
          } else {
            const prevProps = current.memoizedProps;
            const prevState = current.memoizedState;
            // 更新阶段，执行componentDidUpdate
            instance.componentDidUpdate(
              prevProps,
              prevState,
              instance.__reactInternalSnapshotBeforeUpdate
            );
          }
        }
        const updateQueue = finishedWork.updateQueue;
        if (updateQueue !== null) {
          commitUpdateQueue(finishedWork, updateQueue, instance);
        }
        break;
      }
    }
  }
}

/**
 * @description: commitMutation阶段
 */
export function commitMutationEffects(root: FiberRoot, finishedWork: Fiber) {
  commitMutationEffectsOnFiber(finishedWork, root);
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
      // 删除子节点
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      return;
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
    // 如果兄弟节点不存在，说明当前节点是最后一个节点
    while (node.sibling === null) {
      // 这种场景还不知道是什么，先加个error
      if (node.return === null) {
        throw Error("getHostSibling：node.return === null ");
      }
      // 根据节点类型判断这个该fiber的父节点是否存在真实dom，像function component fiber是没有对应的stateNode的
      if (node.return === null || isHostParent(node.return)) return null;
      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;

    // 节点不是普通元素或者文本节点
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 如果这个兄弟节点是需要插入的，则去尝试获取下一个兄弟节点
      if (node.flags & Placement) {
        continue siblings;
      }

      // 例如function component本身是不存在对应的stateNode的，所以如果它的child也不存在，则尝试获取下一个兄弟节点
      if (node.child === null) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }

    // 如果兄弟节点不是需要插入的节点，那么要插入的节点这个兄弟节点就是锚点节点
    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
  }
};

/**
 * @description: 副作用销毁
 */
export function commitPassiveUnmountEffects(firstChild: Fiber): void {
  nextEffect = firstChild;
  commitPassiveUnmountEffects_begin();
}

function commitPassiveUnmountEffects_begin() {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    const child = fiber.child;

    // TODO 节点有删除的情况，需要对删除的节点进行副作用清理
    if ((nextEffect.flags & ChildDeletion) !== NoFlags) {
      const deletions = fiber.deletions;
      throw Error("commitPassiveUnmountEffects_begin ChildDeletion");
    }

    if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && child !== null) {
      child.return = fiber;
      nextEffect = child;
    } else {
      commitPassiveUnmountEffects_complete();
    }
  }
}

function commitPassiveUnmountEffects_complete() {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    if ((fiber.flags & Passive) !== NoFlags) {
      commitPassiveUnmountOnFiber(fiber);
    }

    // 处理兄弟节点
    const sibling = fiber.sibling;
    if (sibling !== null) {
      sibling.return = fiber.return;
      nextEffect = sibling;
      return;
    }

    // 处理父节点
    nextEffect = fiber.return;
  }
}

function commitPassiveUnmountOnFiber(finishedWork: Fiber) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      commitHookEffectListUnmount(HookPassive | HookHasEffect, finishedWork);
      break;
    }
  }
}

function commitHookEffectListUnmount(flags: HookFlags, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null =
    finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) === flags) {
        const destroy = effect.destroy;
        effect.destroy = undefined;
        // 执行上一个effect返回的销毁函数
        if (destroy != null) {
          destroy();
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

/**
 * @description: beforeMutationEffect阶段，当前应用树状态变更之前的操作，是getSnapshotBeforeUpdate调用的地方
 */
export function commitBeforeMutationEffects(
  root: FiberRoot,
  firstChild: Fiber
) {
  nextEffect = firstChild;
  commitBeforeMutationEffects_begin();
}

/**
 * @description: commitBeforeMutation递阶段
 */
function commitBeforeMutationEffects_begin() {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    const child = fiber.child;
    // 找到第一个subtreeFlags中不包含BeforeMutationMask并且存在子节点的fiber（递）
    if (
      (fiber.subtreeFlags & BeforeMutationMask) !== NoFlags &&
      child !== null
    ) {
      child.return = fiber;
      nextEffect = child;
    } else {
      commitBeforeMutationEffects_complete();
    }
  }
}

/**
 * @description: commitBeforeMutation归阶段
 */
function commitBeforeMutationEffects_complete() {
  // 从子到父进行归处理（归）
  while (nextEffect !== null) {
    const fiber = nextEffect;
    commitBeforeMutationEffectsOnFiber(fiber);

    const sibling = fiber.sibling;
    if (sibling !== null) {
      sibling.return = fiber.return;
      nextEffect = sibling;
      return;
    }

    nextEffect = fiber.return;
  }
}

function commitBeforeMutationEffectsOnFiber(finishedWork: Fiber) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  if ((flags & Snapshot) !== NoFlags) {
    switch (finishedWork.tag) {
      case ClassComponent: {
        // 更新阶段执行的操作
        if (current !== null) {
          const prevProps = current.memoizedProps;
          const prevState = current.memoizedState;
          const instance = finishedWork.stateNode;
          const snapshot = instance.getSnapshotBeforeUpdate(
            prevProps,
            prevState
          );
          // 将getSnapshotBeforeUpdate的返回值挂在到__reactInternalSnapshotBeforeUpdate属性上，将来作为componentDidUpdate的第三个参数
          instance.__reactInternalSnapshotBeforeUpdate = snapshot;
        }
        break;
      }
    }
  }
}

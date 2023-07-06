# React 18源码解析（三）—— 初始化渲染



### 该部分解析基于我们实现的简单版react18中的代码，是react18源码的阉割版，希望用最简洁的代码来了解react的核心原理。其中大部分逻辑和结构都和源码保持一致，方便阅读源代码。



上一章节介绍了 react render 阶段的处理流程，包括递阶段 beginWork 和归阶段 commitWork，这一节将继续介绍接下去的 commit 阶段。



### 一、commit 阶段

commit 属于提交阶段，提交阶段主要做的就是一些副作用处理还有 DOM 操作，它由三部分组成：

- before mutation阶段：当前应用树状态变更之前的操作，是getSnapshotBeforeUpdate调用的地方
- mutation阶段： 处理一些副作用，一般都是dom操作，比如更新删除插入dom
- layout阶段：componentDidMount、componentDidUpdate调用的地方

在 before mutation 之前以及 layout 之后其实还有其它工作需要处理，但是对于我们的 demo 来说只涉及到 DOM 操作，所以只需要了解 mutation 阶段的操作即可。

```typescript
// react-reconciler/src/ReactFiberWorkLoop.ts
function commitRoot(root: FiberRoot) {
  commitRootImpl(root);
}

function commitRootImpl(root: FiberRoot) {
  // 省略其它代码
  // beforeMutationEffect阶段，当前应用树状态变更之前的操作，是getSnapshotBeforeUpdate调用的地方
  commitBeforeMutationEffects(root, finishedWork);

  // 处理一些副作用，一般都是dom操作，比如更新删除插入dom
  commitMutationEffects(root, finishedWork);

  // 渲染完成，将current指向workInProgress（双缓存机制的最后一步）
  root.current = finishedWork;

  // layout阶段，componentDidMount、componentDidUpdate调用的地方
  commitLayoutEffects(finishedWork, root);
  
  // 省略其它代码
}
```

mutation 阶段的核心逻辑在 commitMutationEffectsOnFiber 中。在 commitMutationEffectsOnFiber 内部会根据 fiber 的类型做不同的处理逻辑，这些不同点主要提现在更新逻辑上。对于初始化渲染我们需要关注的是 recursivelyTraverseMutationEffects 和 commitReconciliationEffects的逻辑。

```typescript
// react-reconciler/src/ReactFiberCommitWork.ts
export function commitMutationEffects(root: FiberRoot, finishedWork: Fiber) {
  commitMutationEffectsOnFiber(finishedWork, root);
}

function commitMutationEffectsOnFiber(finishedWork: Fiber, root: FiberRoot) {
  const current = finishedWork.alternate!;
  const flags = finishedWork.flags;

  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      // 省略更新逻辑
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
      // 省略更新逻辑
      return;
    }
    case HostRoot:
      recursivelyTraverseMutationEffects(root, finishedWork);
      return;
    case HostText: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      // 省略更新逻辑
      return;
    }
    default: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      return;
    }
  }
}
```

recursivelyTraverseMutationEffects 的处理逻辑：

1. 判断是否有需要删除的子节点，更新阶段可能会走这个逻辑
2. 根据 subtreeFlags 中是否有相关的更新 flags（MutationMask） 来判断子节点是否需要更新，MutationMask 中有 Placement 的标记，这个标记在上一章节有介绍，在需要插入 DOM 的时候会标记上 Placement。

```typescript
// react-reconciler/src/ReactFiberCommitWork.ts
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
    
// react-reconciler/src/ReactFiberFlags.ts
export const MutationMask = Placement | Update | ChildDeletion;
```

commitReconciliationEffects 内部的核心逻辑是 commitPlacement。在 commitPlacement 中会根据 parentFiber 的类型做不同的处理，这里常见的是 HostComponent（普通元素节点）和 HostRoot（当前应用的根节点）的处理。这里的 parentFiber 不单纯是指 fiber.return，还需要节点的类型是普通元素节点或者是当前应用的根节点，因为后续需要进行真实 DOM 操作，只有这两种节点才有对应的真实 DOM 节点。像 Function Component 等节点是没有对应的真实 DOM 节点，只有其内部返回的子元素才有可能拥有真实的 DOM 节点。

```typescript
// react-reconciler/src/ReactFiberCommitWork.ts
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
      // 省略其它代码
    }
    case HostRoot: {
      // 省略其它代码
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

const isHostParent = (fiber): boolean => fiber.tag === HostComponent || fiber.tag === HostRoot;
```

HostComponent 和 HostRoot 的处理逻辑基本上一样：

1. 获取父节点的真实 DOM 以及其下一个兄弟节点，原因是在进行 DOM 插入的时候有两种方式，第一种通过 parent.appendChild 将 DOM 添加到父节点的末尾，第二种通过 parent.insertBefore 的方式将 DOM 添加到某个已存在的子元素之前。
2. 调用 insertOrAppendPlacementNode/insertOrAppendPlacementNode 进行节点插入操作。在方法内部会先判断当前要插件的节点类型，如果是普通元素节点，则会继续判断 before 节点是否存在，如果存在就调用 insertBefore，否则就调用 appendChild；如果节点是函数式组件或者类组件等其它没有对应真实 DOM 的节点，则会尝试递归处理其子元素。

```typescript
// react-reconciler/src/ReactFiberCommitWork.ts
function commitPlacement(finishedWork) {
  // 省略其它代码
  switch (parentFiber.tag) {
    case HostRoot: {
      // 获取父级Fiber节点，因为插入情况可能有两种，一种是parent.appendChild，另外一种是insertBefore
      // 针对两种方法的插入，对应的锚点节点是不同的
      const parent = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break;
   }
    case HostComponent: {
      const parent = parentFiber.stateNode;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    }
    // 省略其它代码
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
```

这里以我们之前的 demo 为例讲述一下这个过程：

1. 进入 commitMutationEffectsOnFiber 逻辑中，首次进来的 finishedWork 为 hostRoot，会执行 recursivelyTraverseMutationEffects 方法。在 recursivelyTraverseMutationEffects 中判断到 hostRoot 的 subtreeFlags 中存在 Placement 的标记，表示子节点需要进行 DOM 插入，其实就是 App 组件需要插入到页面中。接着循环子 fiber，递归进行 commitMutationEffectsOnFiber 操作，第一个获取到的子 fiber 就是 App fiber。
   <img src="https://raw.githubusercontent.com/scout-hub/picgo-bed/dev/image-20230703190505781.png" alt="image-20230703190505781" style="zoom:80%;" />

2. App fiber 进入到 commitMutationEffectsOnFiber 的逻辑中，它的类型是 FunctionComponent，会执行 recursivelyTraverseMutationEffects 方法，不过 App 组件对应的 subtreeFlags 是 0，表示其子节点不需要进行 DOM 插入。至于为什么是 0 可以回顾上一章节 beginWork 中 Placement 标记的条件以及 completeWork 中的副作用冒泡逻辑。
   ![image-20230703190715973](https://raw.githubusercontent.com/scout-hub/picgo-bed/dev/image-20230703190715973.png)

3. 由于 App fiber 的子节点不需要进行 DOM 操作，因此回到 App fiber 的 commitMutationEffectsOnFiber 逻辑中继续走 commitReconciliationEffects 逻辑。由于 App fiber 上的 flags 是 Placement，因此会走 commitPlacement 的逻辑。在 commitPlacement 中获取到了App fiber 的父节点 hostRoot，hostRoot 对应的真实 DOM 节点是 hostRoot.stateNode.containerInfo，也就是我们调用 ReactDOM.createRoot 传入的容器节点，最后将 App 组件对应的 DOM 添加到容器节点中完成初始化渲染。

   ![image-20230703190932765](../../Library/Application Support/typora-user-images/image-20230703190932765.png)
   ![image-20230703191056926](https://raw.githubusercontent.com/scout-hub/picgo-bed/dev/image-20230703191056926.png)

```jsx
// demo
const App = () =>{
  return <div><span></span></div>;
}
```

至此，mutation 阶段的流程大致就结束了。最后还需要将 root.current 指向 finishedWork，这个 finishedWork 是内存中构建的 fiber 树，当 DOM 更新完成后，root.current 相应的也要指向最新的 fiber 树，完成双缓存的最后一步。


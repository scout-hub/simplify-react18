# React 18源码解析（四）——  更新



### 该部分解析基于我们实现的简单版react18中的代码，是react18源码的阉割版，希望用最简洁的代码来了解react的核心原理。其中大部分逻辑和结构都和源码保持一致，方便阅读源代码。



前几个章节简单介绍了`react`初始化渲染的过程，这一章节将介绍`react`更新阶段的大致过程。



### 一、update 调度

在`react`中可以通过一下几种方式发起调度更新：

- `ReactDOM.createRoot().render()`：初始化渲染时发起的调度更新
- `this.setState`：`class`组件内部发起的调度更新
- `forceUpdate`：强制组件更新，要考虑性能问题
- `useState`：调用`useState`返回的结果数组中的第二个参数可以发起`hooks`组件的调度更新
- `useReducer`：同`useState`类似，只是`useReducer`可以进行更加复杂的`action`逻辑

更新阶段发起的调度其实跟初始化渲染大致相同，都是调用`scheduleUpdateOnFiber`发起调度更新。同样的，在发起调度之前都会创建对应的`update`更新对象，将其进行入队操作，这些`update`对象都会在`beginWork`阶段被计算，得到新的`state`状态。

发起调度的逻辑我们在初始化渲染的时候已经大致了解过了，这里就不再赘述。在更新阶段，核心就是比较新旧`fiber`节点，找出变化的部分进行更新处理，最终提交到`DOM`上。新旧 fiber 的比较过程主要在`beginWork`阶段执行，这个过程也就是我们俗称的`DOM Diff`。



### 二、DOM Diff

`DOM Diff` 就是将新旧两棵树进行对比，但是传统的比较算法中复杂度至少也在 O(n³)。如果树的节点过多，那么这将是一个非常耗时的过程。因此，react 对 `DOM Diff` 做了几个限制：

- 只对同级元素进行`Diff`。如果一个`DOM节点`在前后两次更新中跨越了层级，那么`React`不会尝试复用他。
- 如果一个节点的类型变了，比如从`div`变成了`span`，那么`react`会删除`div`及其后代节点并再创建`span`及其后代节点。
- 通过`key`属性来标识变化前后哪些元素是一致的，比如旧节点为`<div key="1"></div><span key="2"></span>`，新节点为`<span key="2"></span><div key="1"></div>`，单独根据第二点的话会将旧的`<div key="1"></div>`和`<span key="2"></span>`删除并创建新的`<span key="2"></span>`和`<div key="1"></div>`。但实际上它们只是变换了节点位置，不需要删除再重新创建。此时就可以根据`key`来找变化后的元素，如果找到了说明可以复用节点。



`DOM Diff`的实现入口在`reconcileChildFibers`中，在这个方法中通过`newChild`的类型来区分单子节点和多子节点的处理。

```typescript
/**
 * @description: diff的入口
 */
function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    lanes: Lanes
  ) {
    // 省略其它代码
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
    // 省略其它代码
  }
```

首先是单节点的`Diff`，这个过程在`reconcileSingleElement`中实现，这个方法接受 4 个参数：

- `returnFiber`：父`fiber`
- `currentFirstChild`：旧子节点
- `element`：新子节点
- `lanes`：优先级，咱不需要了解

该方法的主要逻辑：

1. 如果旧节点存在，则需要循环处理旧子节点，因为旧子节点可能有多个，需要逐一进行处理。

2. 判断当前旧子节点的`key`和新节点的`key`是否相同。
   2.1  如果`key`相同，说明已经匹配到了新旧节点，这也就意味着后续的旧节点直接删除即可`(deleteRemainingChildren)`，因为新节点是单节点且已经匹配到旧节点了，后续不可能再有其它旧节点能匹配到该新节点。接下去继续匹配节点类型。

   ​	2.1.1  如果新旧节点类型是`Fragment`，则需要创建`Fragment`类型的`fiber`，这个`Fragment`是`react`内部定义的类型，不是`DOM`片段。
   ​    2.1.2  如果新旧节点类型相同则复用`fiber`（`useFiber`）
   ​    2.1.3  如果类型不同则跳出循环，直接创建新的`fiber`（`createFiberFromElement`）

   2.2  如果`key`不同，说明当前旧节点需要被删除，后续再找它的兄弟节点去匹配（`child = child.sibling`）。

3. 旧节点不存在，直接创建新`fiber`。

```typescript
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
        // Fragment片段
        if (elementType === REACT_FRAGMENT_TYPE && child.tag === Fragment) {
          // 这里是single elment的处理，也就是只有一个子节点，所以后面的兄弟节点可以全部删除
          deleteRemainingChildren(returnFiber, child.sibling);
          // Fragment的pendingProps只需要children
          const existing = useFiber(child, element.props.children);
          existing.return = returnFiber;
          return existing;
        } else if (child.elementType === elementType) {
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
    // 没有节点复用（比如首屏渲染的hostRoot的current是没有child节点的）直接创建fiber节点
    const created: Fiber = createFiberFromElement(element, lanes);
    created.return = returnFiber;
    return created;
  }
```

上面流程中的节点删除并不是真的删除，只是将需要删除的`fiber`节点添加到父`fiber`的`deletions`数组中，并且会在父`fiber`上添加需要删除子`fiber`的副作用标记`ChildDeletion`，后续会在`commit`中的`mutation`阶段执行 commitDeletionEffects 删除`DOM`。

```typescript
 // react-reconciler/src/ReactChildFiber.ts 
 function deleteChild(returnFiber: Fiber, childToDelete: Fiber) {
    const deletions = returnFiber.deletions;
    // 如果deletions不存在，则创建一个
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      // 添加需要删除的fiber
      deletions.push(childToDelete);
    }
  }
```

其次是比较复杂的多节点`diff` ，这个过程在`reconcileChildrenArray`中实现。由于`react fiber`是一种链表形式的数据结构，不能像传统数组一样通过首尾双指针的方式进行遍历。并且`react`团队发现，相较于节点的新增和删除，更新节点会更为频繁。因此，`react`采用了两次循环的方式进行处理。第一次循环处理节点更新的情况，第二次循环则处理节点新增和删除的情况。

- 对于第一轮遍历，只是将能意义匹配对应到的节点进行更新，如果其中存在匹配不到的情况就会跳出循环，进入第二轮遍历
- 对于第二轮遍历，有四种情况：
  1. 新节点遍历完了，但是老节点还存在，此时需要删除剩余的老节点
  2. 新节点还没遍历完，老节点遍历完了，此时剩余的新节点需要新增
  3. 新老节点都还没有遍历完，此时说明有节点位置发生了变化，需要进行位置移动，这也是`diff`中最难理解的地方
  4. 新老节点全部遍历完了

```typescript
// react-reconciler/src/ReactChildFiber.ts
function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<any>,
    lanes: Lanes
  ): Fiber | null {
    let oldFiber = currentFirstChild;
    let newIndex = 0;
    // lastPlacedIndex 上一次dom插入的最远位置 用以判断dom移动的依据
    let lastPlacedIndex = 0;
    // 下一个oldFiber || 缓存当前oldFiber
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
     * 并且react发现相较于新增和删除节点，更新节点的频率是比较高的
     * 因此，在处理的优先级上以更新作为高优先级的操作。
     * 基于上述原因，diff的时候需要做两次循环，一次遍历节点更新的情况，第二次遍历不是更新的情况
     */

    // 1、第一轮处理节点更新的情况，遇到不能复用的节点就跳出循环
    for (; oldFiber !== null && newIndex < childrenLength; newIndex++) {
      if (oldFiber.index > newIndex) {
        /**
         * 这种情况，可能是新的children数组种有一个节点是null，但是这个节点不会生成fiber，但是它会参与到diff的过程中
         * 例如：
         * 模板中的jsx是这样的，{null}<div>{num}</div>，里面的null是不会生成fiber节点，但是它会在children数组中
         * 假如num变化使得视图更新了，新的children数组就是[null,div]，这时对children进行diff的时候，第一个遍历到的
         * 其实是div的fiber节点，而循环对应的是children数组中的null，对于这种情况需要跳出循环即
         */
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }

      // 更新 fiber
      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIndex],
        lanes
      );

      // 当前节点不可复用，跳出循环
      if (newFiber === null) {
        // 处理children中有null这种情况
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }
        break;
      }

      if (shouldTrackSideEffects) {
        /**
         * 通过key匹配到了节点，但是由于类型不同不会复用，此时会创建一个新的fiber，这个fiber还没有alternate
         *
         * 例如：
         * 老节点
         * <ul>
         *   <li key="0" className="before">0</li>
         *   <li key="1">1</li>
         * </ul>
         *
         * 新节点
         *  <ul>
         *    <div key="0">0</div>
         *    <li key="1">1</li>
         *  </ul>
         *
         * li key 0匹配到了div key 0，但是由于类型不同，不能复用，此时需要删除老的li，创建新的div
         */
        if (oldFiber && newFiber.alternate === null) {
          deleteChild(returnFiber, oldFiber);
        }
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    // 2、已经遍历完所有的新节点了，剩余的老节点都需要删除掉
    if (newIndex === childrenLength) {
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    // 3、新节点还没有遍历完，但是old fiber已经遍历完了，那么剩下的新节点只需要插入到后面就行了
    if (oldFiber === null) {
      for (; newIndex < newChildren.length; newIndex++) {
        const newFiber = createChild(returnFiber, newChildren[newIndex], lanes);
        if (newFiber === null) {
          // 新的节点是个null，比如模板中的{null}，这会占一个位置，但是是个空节点，不需要管
          continue;
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

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

    // 4、剩余复杂情况处理

    // 为剩余未处理的节点生成一个Map映射表
    const existingChildren = mapRemainingChildren(oldFiber);

    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIndex,
        newChildren[newIndex],
        lanes
      );
      if (newFiber !== null) {
        // 说明复用到了老的fiber节点，这里需要将当前节点从existingChildren中移除，避免被添加到deletions中
        if (shouldTrackSideEffects && newFiber.alternate !== null) {
          existingChildren.delete(
            newFiber.key === null ? newIndex : newFiber.key
          );
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    // 剩余还存在existingChildren中的节点都是没有复用的节点，需要删除
    if (shouldTrackSideEffects) {
      existingChildren.forEach((child) => deleteChild(returnFiber, child));
    }

    return resultingFirstChild;
  }
```

接下去以几个`demo`为例分析一下这个过程：

- 节点属性更新：新旧`DOM`中只有`li`的类名发生了变化，因此在第一轮循环中会直接使用`updateSlot`进行更新，返回复用后的`fiber`节点。其中`updateSlot`和`updateElement`方法相继对`key`和`tag`进行了判断处理。
  ```jsx
  // demo.jsx
  const oldDom = (
    <ul>
      <li key="0" className="before">
        0
      </li>
      <li key="1">1</li>
    </ul>
  );
  
  // 情况1 —— 节点属性变化
  const newDom = (
    <ul>
      <li key="0" className="after">
        0
      </li>
      <li key="1">1</li>
    </ul>
  );
  
  // react-reconciler/src/ReactChildFiber.ts
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
          if (key !== null) {
            throw Error("updateFragment key!==null");
          }
          // fragment节点更新的情况
          return updateFragment(returnFiber, oldFiber, newChild, lanes, null);
        }
      }
  
      return null;
    }
  
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
  ```

- 节点类型不同：这个例子和上面那个例子类似，只不过第一个`li`在更新后变成了`div`，这种情况会在`updateElement`内部处理，当新旧节点的`elementType`不同时会创建一个新的`fiber`，并且这个新的`fiber`是没有`alternate`属性的，因此在第一轮循环中会执行`deleteChild`方法将旧的`fiber`删除。
  ```jsx
  // demo.jsx
  const oldDom = (
    <ul>
      <li key="0">
        0
      </li>
      <li key="1">1</li>
    </ul>
  );
  
  // 情况1 —— 节点属性变化
  const newDom = (
    <ul>
      <div key="0">
        0
      </li>
      <li key="1">1</li>
    </ul>
  );
  
  // reconcileChildrenArray
   if (oldFiber && newFiber.alternate === null) {
       deleteChild(returnFiber, oldFiber);
   }
  ```

- 节点删除：新旧`DOM`中`key`为 2 的`li`节点被删除。第一轮循环遍历新节点，其中依次匹配到了`key`为 0 和 1 的`li`节点，这两个节点对应的`fiber`会被复用，此时第一轮循环结束并且newIndex === childrenLength`，表示新子节点都遍历完了，此时需要将剩下没有匹配到的旧节点全部删除。
  ```jsx
  // demo.jsx
  const oldDom = (
    <ul>
      <li key="0">0</li>
      <li key="1">1</li>
      <li key="2">2</li>
    </ul>
  );
  
  const newDom = (
    <ul>
      <li key="0">0</li>
      <li key="1">1</li>
    </ul>
  );
  // reconcileChildrenArray
  // 已经遍历完所有的新节点了，剩余的老节点都需要删除掉
  if (newIndex === childrenLength) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  ```

- 节点新增：新旧`DOM`中新增了`key`为 2 的`li`节点。在第一轮循环中依次复用了`key`为 0 和 1的`li`节点，此时旧的节点已经全部遍历完，但是新的节点还没处理，这个节点会在第二轮循环中进行处理，创建新的`fiber`。
  ```jsx
  // demo.jsx
  const oldDom = (
    <ul>
      <li key="0">0</li>
      <li key="1">1</li>
    </ul>
  );
  
  const newDom = (
    <ul>
      <li key="0">0</li>
      <li key="1">1</li>
      <li key="2">2</li>
    </ul>
  );
  
  // reconcileChildrenArray
  // 新节点还没有遍历完，但是old fiber已经遍历完了，那么剩下的新节点只需要插入到后面就行了
  if (oldFiber === null) {
    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChildren[newIndex], lanes);
      if (newFiber === null) {
        // 新的节点是个null，比如模板中的{null}，这会占一个位置，但是是个空节点，不需要管
        continue;
        }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);
  
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
  ```

- 节点移动的情况：新旧`DOM`中三个`li`节点相对其它两个都发生了位置移动，此时通过索引去匹配的方式肯定无法匹配成功。

  针对这种情况，`react`会先为剩余未处理的老节点构建一个映射表，键为`key`值或者索引值，值为`oldfiber`。当映射表构建完成后开始循环处理新节点，通过`updateFromMap`去更新节点，`updateFromMap`中会通过`newfiber`的`key`或者索引值去映射表里面查找`oldfiber`，如果匹配到了则进行复用并将改节点从映射表中删除，因为最后还存在映射表中的节点会被认为是没有匹配到的节点，需要被删除。

  ```jsx
  // demo.jsx
  const oldDom = (
    <ul>
      <li key="0">0</li>
      <li key="1">1</li>
      <li key="2">2</li>
    </ul>
  );
  
  const newDom = (
    <ul>
      <li key="1">1</li>
      <li key="2">2</li>
      <li key="0">0</li>
    </ul>
  );
  
  // reconcileChildrenArray
  // 为剩余未处理的节点生成一个Map映射表
  const existingChildren = mapRemainingChildren(oldFiber);
  for (; newIndex < newChildren.length; newIndex++) {
       const newFiber = updateFromMap(
         existingChildren,
         returnFiber,
         newIndex,
         newChildren[newIndex],
         lanes
       );
       if (newFiber !== null) {
         // 说明复用到了老的fiber节点，这里需要将当前节点从existingChildren中移除，避免被添加到deletions中
         if (shouldTrackSideEffects && newFiber.alternate !== null) {
           existingChildren.delete(
             newFiber.key === null ? newIndex : newFiber.key
           );
         }
         lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);
         if (previousNewFiber === null) {
           resultingFirstChild = newFiber;
         } else {
           previousNewFiber.sibling = newFiber;
         }
         previousNewFiber = newFiber;
       }
     }
  
  // react-reconciler/src/ReactChildFiber.ts
  function mapRemainingChildren(
      currentFirstChild: Fiber
    ): Map<string | number, Fiber> {
      const existingChildren: Map<string | number, Fiber> = new Map();
  
      let existingChild: Fiber | null = currentFirstChild;
  
      while (existingChild !== null) {
        if (existingChild.key !== null) {
          existingChildren.set(existingChild.key, existingChild);
        } else {
          existingChildren.set(existingChild.index, existingChild);
        }
        existingChild = existingChild.sibling;
      }
      return existingChildren;
    }
    
    function updateFromMap(
      existingChildren: Map<string | number, Fiber>,
      returnFiber: Fiber,
      newIndex: number,
      newChild: any,
      lanes: Lanes
    ): Fiber | null {
      if ((isString(newChild) && newChild !== "") || isNumber(newChild)) {
        // 文本节点没有key，所以不需要检查key，只需要它们都是文本节点就更新
        const matchedFiber = existingChildren.get(newIndex) || null;
        return updateTextNode(returnFiber, matchedFiber, "" + newChild, lanes);
      }
  
      if (isObject(newChild)) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE: {
            // 找到匹配到的fiber进行更新
            const matchedFiber =
              existingChildren.get(
                newChild.key === null ? newIndex : newChild.key
              ) || null;
            return updateElement(returnFiber, matchedFiber, newChild, lanes);
          }
        }
  
        if (isArray(newChild)) {
          throw Error("updateFromMap newChild is array");
        }
      }
      return null;
    }
  ```

  当`fiber`创建完成后需要判断这个`fiber`对应的节点是否需要移动，判断依据就是在变化前后元素的相对位置是否依旧是递增关系，这个关系会借助`lastPlacedIndex`这个变量（上一次`DOM`插入的最远位置）。比如老节点是 0、1、2，新节点是 2、1、0，初始化`lastPlacedIndex`为 0。第一次遍历新节点 2，2 在老节点中的位置索引是 2，2 不小于`lastPlacedIndex(0)`，所以 2 不需要动，并且`lastPlacedIndex`更新为 2。第二次遍历新节点 1,1 在老节点中的位置索引是 1，1 要比于`lastPlacedIndex(2)`小，所以 1 这个节点需要移动。从结果上看，原先 1，2 节点位置处于递增关系，但是更新后并不再保持这种关系，意味着 1 这个节点发生了移动。同理，第三次遍历 0 这个节点也一样。对于需要移动的节点，`react`会为其标记上`Placement`这个副作用标记。

  ```typescript
  // react-reconciler/src/ReactChildFiber.ts  
   function placeChild(
      newFiber: Fiber,
      lastPlacedIndex: number,
      newIndex: number
    ): number {
      newFiber.index = newIndex;
      // mount的时候lastPlacedIndex不需要操作，没有意义
      if (!shouldTrackSideEffects) return lastPlacedIndex;
      const current = newFiber.alternate;
  
      if (current !== null) {
        const oldIndex = current.index;
        if (oldIndex < lastPlacedIndex) {
          /**
           * 节点移动的情况
           * 例如：
           * old：0 1 2
           * new：2 1 0
           * 当遍历到2时，2在老的位置索引是2，即lastPlacedIndex为2
           * 当遍历到1时，1在老的位置时1，此时这个索引位置要比lastPlacedIndex小，
           * 说明1对应的节点需要进行节点移动
           */
          newFiber.flags |= Placement;
          return lastPlacedIndex;
        } else {
          // 节点可以保持在原位置
          return oldIndex;
        }
      } else {
        // 插入节点的情况
        newFiber.flags |= Placement;
        return lastPlacedIndex;
      }
    }
  ```

  其实`react`这种判断方式存在一定的缺陷。假设旧节点是 0,1,2，新节点是 2,0,1。按照上述的方式 0 和 1 都需要进行移动，因为 0 和 1 相对 2 的位置都是递减的关系。实际上我们只需要将 2 这个节点移动到 0 之前即可，不需要将 0 和 1 都移动到 2 节点后面，原先的方式显然会多一次移动。假设有`n`个节点，每次更新时都将最后一个节点移动到最前面，那么这种方式会多移动`n-2`次，开发过程中我们也要尽量避免这种将元素从末尾移动到开头的情况。



### 三、更新并提交 DOM

我们在上面提到的`Diff`流程在`beginWork`阶段执行，这个过程会更新`fiber`树，随后进入到`completeWork`阶段。这个阶段在之前的初始化渲染中只讲到了`mount`的过程，这里将介绍`update`的过程。对于`update`的过程，我们只需要关注普通元素节点和文本节点的`update`逻辑。

```typescript
// react-reconciler/src/ReactFiberCompleteWork.ts
export function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // 片段
    case Fragment:
    // 函数式组件
    case FunctionComponent: {
      bubbleProperties(workInProgress);
      return null;
    }
    case ClassComponent: {
      bubbleProperties(workInProgress);
      return null;
    }
    // 当前应用的根结点
    case HostRoot: {
      bubbleProperties(workInProgress);
      return null;
    }
    // 普通元素节点
    case HostComponent: {
      const type = workInProgress.type;
      if (current !== null && workInProgress !== null) {
        // 更新
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        // 省略 mount 阶段代码
      }
      bubbleProperties(workInProgress);
      return null;
    }
    // 处理文本节点
    case HostText: {
      const newText = newProps;
      if (current && workInProgress.stateNode != null) {
        // 说明是update阶段，这里需要处理文本节点的副作用
        const oldText = current.memoizedProps;
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        // 省略 mount 阶段代码
      }
      bubbleProperties(workInProgress);
      return null;
    }
  }
  return null;
}
```

对于普通的元素节点`HostComponent`，在更新时会执行`updateHostComponent`方法：

1. 判断新旧`fiber`上的`props`是否相同，如果相同则说明没有属性要更新，直接返回；如果不同则调用`prepareUpdate`方法找出变化的`props`。
2. 将变化的`props`赋值到`fiber`的`updateQueue`上并为该`fiber`标记上`Update`这个副作用标记。

```typescript
// react-reconciler/src/ReactFiberCompleteWork.ts
function updateHostComponent(
  current: Fiber,
  workInProgress: Fiber,
  type: any,
  newProps: any
) {
  const oldProps = current.memoizedProps;
  // 新旧props一样，直接返回
  if (newProps === oldProps) {
    return;
  }
  const instance: Element = workInProgress.stateNode;
  // 新旧的属性不一样，找出变化的属性进行更新
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
  workInProgress.updateQueue = updatePayload;
  if (updatePayload) {
    markUpdate(workInProgress);
  }
}
```

对于普通的元素节点`HostText`，在更新时会执行`updateHostText`方法。这个方法比较简单，判断新旧文本内容是否相同，如果不同则会打上`Update`标记。

```typescript
// react-reconciler/src/ReactFiberCompleteWork.ts
function updateHostText(
  current: Fiber,
  workInProgress: Fiber,
  oldText: string,
  newText: string
) {
  if (oldText !== newText) {
    markUpdate(workInProgress);
  }
}
```

最后一步就是提交更新操作，这个过程在`commit`流程中的`mutation`阶段执行，这个阶段在初始化流程章节中也只介绍了`mount`的过程，这里我们继续补充一下`update`的过程。

```typescript
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
```

首先是`recursivelyTraverseMutationEffects`方法，之前介绍的时候我们略过了删除的逻辑。在上面介绍`Diff`的过程中我们知道，所有需要删除的`fiber`都会存储到父`fiber`的`deletions`属性中，这里就会循环这个属性值，依次对每一个`fiber`执行`commitDeletionEffects`。

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
}
```

在`commitDeletionEffects`中会先查找当前需要删除节点的父节点，接着调用`commitDeletionEffectsOnFiber`进行深层次的删除操作，因为当前需要删除的节点可能还有后代节点以及兄弟节点，这些节点都需要执行删除操作（`removeChild`）。最后调用`detachFiberMutation`切断与父`fiber`之间的联系。

```typescript
// react-reconciler/src/ReactFiberCommitWork.ts
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
    case FunctionComponent: {
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      return;
    }
    case ClassComponent: {
      throw Error("unmount class component");
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
```

其次是节点的插入操作`commitPlacement`，对于节点位置变化的插入处理，其关键逻辑在`getHostSibling`中，也就是找到当前节点的后继节点，只要找到了后继节点，就可以通过`insertBefore`进行处理，如果没找到则调用父节点的`appendChild`方法。

```typescript
// react-reconciler/src/ReactFiberCommitWork.ts
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
```

`getHostSibling`主要逻辑如下：

1. 如果当前`fiber`没有兄弟`fiber`则说明当前`fiber`对应的`DOM`节点可能是同层`DOM`树节点中的最后一个节点。如果其父`fiber`是一个普通元素`fiber`，那么当前`fiber`对应的`DOM`节点一定是同层`DOM`树节点中的最后一个节点，此时返回`null`；如果父`fiber`不是一个普通元素节点，比如是`Function`组件对应的`fiber`，由于`Function fiber`没有对应的真实`DOM`，因此`Function fiber`的`siblings`就有可能是后继节点，需要继续去判断处理。如下图所示，`App`组件内部的子元素`div`在`fiber`树中没有兄弟`fiber`，但是在真实`DOM`树中其实是有兄弟节点的，这个节点就是`App fiber`的兄弟`span fiber`对应的真实`DOM`。
   ![image-20230705172932135](https://raw.githubusercontent.com/scout-hub/picgo-bed/dev/image-20230705172932135.png)
2. 当前`fiber`存在兄弟`fiber`，且这个兄弟`fiber`不是普通元素/文本节点。如果这个兄弟`fiber`也是需要插入的，那么需要继续找下一个兄弟`fiber`，因为插入操作是`insertBefore`，需要保证后继节点一定是稳定的节点，后续不能存在位置的变动。如果节点是稳定的，那么需要进一步循环处理子节点的情况。
3. 当前`fiber`存在兄弟`fiber`且兄弟`fiber`是稳定的普通元素/文本节点，直接返回该节点，否则继续找下一个兄弟节点。

```typescript
// react-reconciler/src/ReactFiberCommitWork.ts
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
```

当`DOM`操作都处理完成后就需要开始更新属性，在`commitMutationEffectsOnFiber`中，如果当前`fiber`被标记了`Update`，那么就会根据对应的`fiber`类型执行不同的更新操作。

- `HostComponent`：调用`commitUpdate`更新`DOM`属性，`commitUpdate`传入的`updatePayload`就是之前在`completeWork`中通过`prepareUpdate`方法得到的需要更新的属性对象。

  ```typescript
  // react-dom/src/client/ReactDOMHostConfig.ts
  /**
   * @description: 提交dom的更新
   */
  export function commitUpdate(
    domElement: Element,
    updatePayload: Array<any>,
    type: string,
    oldProps: any,
    newProps: any
  ): void {
    updateProperties(domElement, updatePayload, type, oldProps, newProps);
    updateFiberProps(domElement, newProps);
  }
  ```

- `HostText`：调用`commitTextUpdate`对文本内容进行更新。

  ```typescript
  // react-dom/src/client/ReactDOMHostConfig.ts
  export function commitTextUpdate(textInstance: Element, newText: string) {
    textInstance.nodeValue = newText;
  }
  ```

  

当`DOM`更新完成后，最后一步就是将`current`指针指向新的`fiber`树，完成整个更新流程。
<!--
 * @Author: Zhouqi
 * @Date: 2023-06-19 19:17:25
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-06-19 19:17:27
-->
# React 18源码解析（一）—— 初始化渲染



### 该部分解析基于我们实现的简单版react18中的代码，是react18源码的阉割版，希望用最简洁的代码来了解react的核心原理。其中大部分逻辑和结构都和源码保持一致，方便阅读源代码。



### 一、createRoot

在 react18 之前我们采用ReactDOM.render的方式来初始化渲染我们的 react 应用，react18 为我们提供了一个新的Api ReactDOM.createRoot来支持 react18 的新特性 —— concurrent 模式。

``` react
const App = ()=>{ }

// 以前
ReactDOM.render(<App />, document.getElementById('app'));

// 现在
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
```

 createRoot 主要做两件事：

1. 调用createContainer方法创建整个应用的根节点
2. 实例化ReactDOMRoot，在ReactDOMRoot类上定义了 render 方法，也就是后需要发起初始化渲染的入口函数

```typescript
// react-dom/src/client/ReactDOMRoot.ts
export function createRoot(container) {
  // 创建整个应用的根节点
  const root = createContainer(container, ConcurrentRoot);
  // ... 省略其它代码
  return new ReactDOMRoot(root);
}

class ReactDOMRoot {
  public _internalRoot;
  constructor(internalRoot) {
    this._internalRoot = internalRoot;
  }

  // 通过ReactDOM.render将jsx渲染到页面上
  render(children) {
    const root = this._internalRoot;
    updateContainer(children, root);
  }
}
```

上面提到了一个概念叫整个应用的根节点FiberRootNode，后面还会提到一个概念叫应用的根节点RootFiber。在 react18 中我们可以通过如下方法创建多个应用节点，这些应用节点会被整个应用的根节点所管理。因此，整个 react 应用的根节点FiberRootNode只能有一个，而应用的根节点RootFiber可以有多个。

```typescript
const root1 = ReactDOM.createRoot(document.getElementById('root1'));
root1.render(<App1 />);

const root2 = ReactDOM.createRoot(document.getElementById('root2'));
root2.render(<App2 />);
```

在创建 Fiber 节点之前我们需要知道什么是 Fiber。在 React 中，Fiber 是一种数据结构，用来表示组件树中的一个节点。每一个 Fiber 都包含了当前节点的状态、属性、子节点以及一些协调更新的属性等等。在 React 16 之前，React 使用递归的方式来协调更新，这种更新是同步且不可中断的。 JavaScript 是单线程的，这意味着 JavaScript 只能在一个线程中执行代码，我们可以称之为主线成。主线程上会执行 JavaScript 代码、处理事件和更新 UI 界面等任务。随着 react 应用逐渐庞大，组件节点越来越多，层级越来越深，这种更新逻辑就会长时间占用主线程且不能中断执行，导致浏览器无法在当前帧完成页面的渲染更新，从而造成页面卡顿，同时也有可能造成IO操作无法及时响应等问题。因此，React提出了 concurrent 并发模式这个概念。在 concurrent 模式下，更新是可以被中断和恢复的。当浏览器没有空闲时间时，React 会中断更新，将主线程的控制权交还给浏览器，让浏览器可以去做一些事情，比如渲染、处理IO事件等等，等下一次事件循环再恢复更新（如果有空闲时间）。为了能实现更新的中断和恢复，React 提出了 Fiber 架构，用链表的形式来构建节点之间的关系。也许用原先的数组也能够实现中断和恢复，但用链表相对来说是一种更简单的方式，因为链表节点可以通过指针保存与其它节点的引用关系，有了这层引用关系就可以在恢复时继续处理下一个节点。

这里简单模拟了中断和恢复的过程：

```typescript
// 比如当前有一个 react 应用的 fiber 关系如下所示
 const Fiber = {
        tag: 'p',
        next: {
            tag: 'span',
            next: {
                tag: 'div',
                next: null
            }
        }
    }
 // 存储正在处理的Fiber
    let currentFiber = Fiber;
    let interrupt = false;
    const update = (flag) => {
        // 这里 interrupt 为 true 表示没有空闲时间
        while(currentFiber && !interrupt) {
            console.log(currentFiber.tag) // 先打印 p, 一秒后打印 span，再过一秒后打印 div
            interrupt = true;
            // beginWork
            currentFiber = currentFiber.next;
        }
      
      // 被中断时 currentFiber 保存了被中断的 Fiber节点
      
        // 继续模拟恢复更新
        setTimeout(() => {
            if(currentFiber && interrupt) {
                interrupt = false;
                // 恢复更新，此时发起更新的节点是之前被中断的节点 currentFiber
                update();
            }
        }, 1000);
    }

    update();
```

这里大致了解一下 Fiber 数据结构，里面的属性会在后续功能中进行具体介绍：

```typescript
export type Fiber = {
  // 静态数据结构的属性
  tag: WorkTag; // 标识fiber类型，如HostComponent，FunctionComponent，HostRoot
  type: any; // 普通元素就是tag name，函数式组件就是function本身，class组件就是class
  key: null | string; // key属性
  elementType: any; // 元素的类型，是固定不变的，而type可能会改变
  stateNode: any; // fiber节点对应的真实dom节点，当前应用的根节点(rootFiber)的 stateNode 指向整个应用的根节点(fiberRoot)

  // 关联其他Fiber节点形成Fiber树的属性
  return: Fiber | null; // 指向父fiberNode的指针
  sibling: Fiber | null; // 指向兄弟fiberNode的指针
  child: Fiber | null; // 指向第一个子fiberNode的指针
  index: number; // 当前fiberNode在所有同层级fiberNode中的位置索引

  // 保存本次更新造成的状态改变相关信息的属性
  updateQueue: any; // 存放该fiber节点所有的更新
  memoizedState: any; // 类组件保存state信息，函数组件保存hooks信息，dom元素为null
  flags: Flags; // 标记fiber effect，比如fiber节点需要插入还是更新
  subtreeFlags: Flags; // 子fiber树effect标记
  deletions: Array<Fiber> | null; // 需要删除的fiber

  pendingProps: any; // 新的props，还在更新阶段的props
  memoizedProps: any; // 记录上一次更新完毕后的props，已经在dom上的属性

  // 调度优先级相关
  lanes: Lanes;
  childLanes: Lanes;

  // 指向该fiber在另一次更新时对应的fiber
  alternate: Fiber | null; // 双缓存树，指向缓存的fiber。更新阶段，两颗树互相交替。
};
```

我们接着回到createRoot部分，在createRoot里面会调用createContainer创建应用节点：

1. 实例化FiberRootNode，创建整个 react 应用的根节点root
2. 调用createHostRootFiber创建当前应用的根节点uninitializedFiber
3. 将FiberRootNode的 current 指针指向当前应用的根节点
4. 当前应用的根节点的 stateNode 指向FiberRootNode
5. 初始化memoizedState和updateQueue
6. 返回创建好的应用节点root

```typescript
// react-reconciler/src/ReactFiberRoot.ts 
export function createFiberRoot(containerInfo, tag, initialChildren = null) {
  // 1、创建整个React应用的FiberRootNode，这个FiberRootNode是一个管理者的作用
  // 2、一个React应用只能有一个FiberRootNode
  // 3、一个FiberRootNode下可以有多个RootFiber
  const root = new FiberRootNode(containerInfo, tag);
  // 1、创建未初始化的的RootFiber
  // 2、通过调用ReactDOM.render渲染出来的，比如ReactDOM.render(<App />,xxxx)，其中App就是一个RootFiber
  const uninitializedFiber: Fiber = createHostRootFiber();
  // 将FiberRootNode的current指向这个未初始化的RootFiber
  root.current = uninitializedFiber;
  // 当前应用（App）的stateNode指向FiberRootNode
  uninitializedFiber.stateNode = root;
  const initialState = {
    element: initialChildren,
  };
  uninitializedFiber.memoizedState = initialState;
  initializeUpdateQueue(uninitializedFiber);
  return root;
}

class FiberRootNode {
  current: any = null; // 指向当前应用的根节点
  finishedWork = null; // 上一次提交更新的根节点 FiberNode
  callbackNode = null; // 调度回调的节点
  callbackPriority = NoLane; // 调度的优先级
  pendingLanes = NoLane; // 等待执行的任务
  expiredLanes = NoLanes; // 记录已经过期的任务
  eventTimes = createLaneMap(NoLanes); // 存储不同优先级的事件时间戳
  expirationTimes = createLaneMap(NoTimestamp); // 存储不同lanes任务的过期时间

  constructor(public containerInfo, public tag) { }
}

// react-reconciler/src/ReactFiber.ts
export function createHostRootFiber() {
  return createFiber(HostRoot, null, null);
}

function createFiber(tag: WorkTag, pendingProps, key: null | string) {
  return new FiberNode(tag, pendingProps, key);
}

class FiberNode {
  type = null;
  elementType = null;
  stateNode = null;
  return = null;
  sibling = null;
  child = null;
  index = 0;
  updateQueue = null;
  memoizedState = null;
  memoizedProps = null;
  lanes = NoLanes;
  childLanes = NoLanes;
  flags = NoFlags;
  subtreeFlags = NoFlags;
  deletions = null;
  alternate = null;

  constructor(public tag, public pendingProps, public key) { }
}
```

初始化updateQueue时会调用initializeUpdateQueue，这个 updateQueue的主要作用就是存储更新相关的数据信息：

- baseState：本次更新前该Fiber节点的状态，Update基于该state计算更新后的state
- firstBaseUpdate、lastBaseUpdate：本次更新前该Fiber节点已保存的Update。以链表形式存在，链表头为firstBaseUpdate，链表尾为lastBaseUpdate
- shared：存储新产生的Update，所有新产生的Update都会添加到shared.pending中形成单向环状链表。当由Update计算state时这个环会被剪开并连接在lastBaseUpdate后面
- effects：组件更新时的副作用回调，比如 class 组件内部 setState 的回调函数

```typescript
// react-reconciler/src/ReactUpdateQueue.ts
export function initializeUpdateQueue<State>(fiber: Fiber): void {
  const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState, 
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null,
      lanes: NoLanes,
    },
    effects: null,
  };
  fiber.updateQueue = queue;
}
```



### 二、render

当我们用 ReactDOM.createRoot创建完根节点后就可以调用根节点上的 render 方法发起初始化渲染

```jsx
// demo.jsx
const App = () =>{
  return <div>hello react</div>
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
```

render方法中主要调用了updateContainer方法：

1. 获取当前应用的根节点 container.current
2. 调用createUpdate创建更新对象 update，react 在发起更新时都会创建一个 update 对象，这个 update 对象针对不同类型的 fiber 节点可能有所不同
3. 将 update 添加到更新队列中，可能会发起多个更新，需要通过更新队列去维护
4. 调用 scheduleUpdateOnFiber 发起更新

```typescript
// react-dom/src/client/ReactDOMRoot.ts
class ReactDOMRoot {
  // 省略其它代码
  // 通过ReactDOM.render渲染页面
  render(children) {
    const root = this._internalRoot;
    updateContainer(children, root);
  }
}

// react-reconciler/src/ReactFiberReconciler.ts
export function updateContainer(element, container) {
  // 获取当前应用的根节点
  const current = container.current;
  // 省略优先级调度相关代码
  // 创建更新，目前只有hostRoot使用（hostRoot和classComponent共用同一种update结构，和function component不同）
  const update = createUpdate(eventTime, lane);
  // hostRoot的payload对应为需要挂载在根节点的组件
  update.payload = { element };
  // 存储更新，添加到更新队列中
  enqueueUpdate(current, update);
  // 调度该fiber节点的更新
  const root = scheduleUpdateOnFiber(current, lane, eventTime);
}
```

createUpdate 方法的功能主要是创建 update 更新对象，classComponent 和 HostRoot 共用这种结构：

```typescript
// react-reconciler/src/ReactUpdateQueue.ts
export type Update<State> = {
  eventTime: number; // 任务时间，通过performance.now()获取的毫秒数
  lane: Lane; // 优先级
  tag: 0 | 1 | 2 | 3; // 更新类型 UpdateState | ReplaceState | ForceUpdate | CaptureUpdate
  payload: any; // 更新挂载的数据，不同类型组件挂载的数据不同。对于ClassComponent，payload为this.setState的第一个传参。对于HostRoot，payload为root.render的第一个传参。
  callback: (() => {}) | null; // 更新的回调函数 commit layout子阶段中有使用
  next: Update<State> | null; // 连接其他update，构成一个链表
};

export function createUpdate(eventTime: number, lane: Lane): Update<any> {
  const update: Update<any> = {
    eventTime,
    lane,
    payload: null,
    callback: null,
    next: null,
    tag: UpdateState,
  };
  return update;
}
```

enqueueUpdate 方法用于将创建的 update 添加到 update 更新队列中。在上面介绍 fiber 的 updateQueue 属性中讲到，所有创建的 update 都会存储在 share.pending 中构成单向环状链表，这一步就是在这里实现的：

```typescript
// react-reconciler/src/ReactUpdateQueue.ts
export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) return;
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  // 构建循环链表
  if (pending === null) {
    // 这是第一个update，自身和自身形成环状链表
    update.next = update;
  } else {
    // 1、将当前插入的Update的next赋值为第一个Update
    update.next = pending.next;
    // 2、将当前最后一个Update的next赋值为插入的Update
    pending.next = update;
  }
  // shared.pending 会保证始终指向最后一个插入的update
  sharedQueue.pending = update;
}
```

scheduleUpdateOnFiber的作用是发起当前 fiber 的调度更新。在 react 中不管是哪个 fiber 节点发起了调度更新，react 都会从当前 fiber 节点开始向上遍历直到寻找到当前应用的根节点（markUpdateLaneFromFiberToRoot），从根节点开始进行更新处理。这也就是意为着 react 只要发起了更新，都会从树的根节点开始处理（有其它优化），从整体掌控更新。这和 vue 的更新是有区别的，vue 是针对性地对需要更新的组件进行处理，细粒度更小，把更新局限在变化的地方。

```typescript
// react-reconciler/src/ReactFiberWorkLoop.ts
export function scheduleUpdateOnFiber(fiber, lane: Lane, eventTime: number) {
  /**
   * react在render阶段从当前应用的根节点开始进行树的深度优先遍历处理，
   * 在更新的时候，当前处理的fiber节点可能不是当前应用的根节点，因此需要通过
   * markUpdateLaneFromFiberToRoot向上去查找当前应用的根节点，同时对查找路径上的
   * fiber进行lane的更新
   */
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (root === null) {
    return null;
  }
  // 省略其它代码
  // 调度应用
  ensureRootIsScheduled(root, eventTime);
  return root;
}
```

ensureRootIsScheduled是核心调度逻辑，内部有大量优先级相关的逻辑判断，这里暂时不考虑优先级相关的处理，只考虑最简单的情况。如果更新任务属于同步任务，则需要通过同步（微任务）的方式去创建任务并执行；否则就会通过 scheduler （宏任务）去调度任务执行。

其中，同步这个概念并不是指代码执行是否是同步的，而是相对于事件循环中的浏览器渲染任务是否是同步的。简单讲述一下这个过程，在一次事件循环中，会先执行一个宏任务，如果宏任务中产生了微任务，则会把这些微任务放到微任务队列中，等宏任务执行完成后依次取出微任务队列中的任务执行，执行过程中产生的微任务会继续放到微任务队列中等待执行，当所有的微任务都执行完成后，浏览器会判断是否需要重新渲染页面。所以，在一次事件循环中，微任务是优先于浏览器渲染任务执行的，所以相对来说是同步的。而宏任务每一次事件循环只会执行一次，所以在一次事件循环中产生的宏任务只会在下一次事件循环中执行，相对本次事件循环中的渲染任务来说是不同步的。

这两种方式对于浏览器渲染任务的影响来说，前者可能会阻塞本次事件循环中的渲染任务执行，后者不会。

```typescript
// react-reconciler/src/ReactFiberWorkLoop.ts
function ensureRootIsScheduled(root: FiberRoot, eventTime: number) {
  // 省略优先级相关的处理
  // 调度一个新的回调
  let newCallbackNode;
  if (newCallbackPriority === SyncLane) {
    // 同步任务的更新
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    // 注册一个微任务
    scheduleMicrotask(flushSyncCallbacks);
    newCallbackNode = null;
  } else {
    // 非同步任务通过scheduler去调度任务
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      // 绑定上当前的root
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }
  root.callbackNode = newCallbackNode;
}
```

这里暂时不考虑首次渲染到底属于什么任务，不管是不是同步任务，最终需要执行的任务（performUnitOfWork）其实都是一样的，只是调度的方式不同，我们假设它是同步的任务。对于同步的任务，react 会使用微任务的方式去调度，这个微任务的回调就是flushSyncCallbacks

```typescript
// react-dom/src/client/ReactDOMHostConfig.ts

// 是否支持Promise
const localPromise = typeof Promise === "function" ? Promise : void 0;

// 是否支持setTimeout
const scheduleTimeout: any = typeof setTimeout === "function" ? setTimeout : undefined

// 执行微任务的函数
export const scheduleMicrotask =
  typeof queueMicrotask === "function"
    ? queueMicrotask
    : localPromise !== void 0
    ? (callback) => localPromise.resolve(null).then(callback)
    : scheduleTimeout;
```

flushSyncCallbacks 大致逻辑就是循环 syncQueue 任务队列，依次取出里面的任务执行。isFlushingSyncQueue 标记是否正在调度同步任务队列，syncQueue用来存储同步任务。在 scheduleSyncCallback 函数中会将需要执行的任务添加到 syncQueue 中，这里存储的同步任务就是 performSyncWorkOnRoot，在下一章节会从 performSyncWorkOnRoot 开始介绍 react 的初始化渲染流程。

```typescript
// react-reconciler/src/ReactFiberSyncTaskQueue.ts
export function flushSyncCallbacks() {
  // 防止重复执行
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true;
    let i = 0;
    try {
      const isSync = true;
      const queue = syncQueue;
      for (; i < queue.length; i++) {
        let callback: SchedulerCallback | null = queue[i];
        do {
          callback = callback(isSync);
        } while (callback !== null);
      }
      syncQueue = null;
    } catch (error) {
      // 当前任务执行出错，跳过它执行下一个任务
      if (syncQueue !== null) {
        syncQueue = syncQueue.slice(i + 1);
      }
      scheduleCallback(ImmediatePriority, flushSyncCallbacks);
      throw error;
    } finally {
      isFlushingSyncQueue = false;
    }
  }
}

export function scheduleSyncCallback(callback: SchedulerCallback) {
  if (syncQueue === null) {
    // 如果syncQueue为null，则创建一个新的数组
    syncQueue = [callback];
  } else {
    // 否则将callback添加到syncQueue数组的末尾
    syncQueue.push(callback);
  }
}
```




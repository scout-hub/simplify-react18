var ReactDOM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/react-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    createRoot: () => createRoot2
  });

  // packages/shared/src/index.ts
  var assign = Object.assign;
  var isObject = (val) => val !== null && typeof val === "object";
  var isString = (val) => typeof val === "string";

  // packages/react-reconciler/src/ReactFiberFlags.ts
  var NoFlags = 0;
  var Placement = 2;

  // packages/react-reconciler/src/ReactWorkTags.ts
  var HostRoot = 3;
  var IndeterminateComponent = 2;
  var FunctionComponent = 0;
  var HostComponent = 5;

  // packages/react-reconciler/src/ReactFiber.ts
  function createHostRootFiber() {
    return createFiber(HostRoot, null);
  }
  function createFiber(tag, pendingProps) {
    return new FiberNode(tag, pendingProps);
  }
  var FiberNode = class {
    constructor(tag, pendingProps) {
      this.tag = tag;
      this.pendingProps = pendingProps;
      this.type = null;
      this.elementType = null;
      this.stateNode = null;
      this.return = null;
      this.sibling = null;
      this.child = null;
      this.index = 0;
      this.alternate = null;
      this.updateQueue = null;
      this.memoizedState = null;
      this.flags = NoFlags;
    }
  };
  function createWorkInProgress(current, pendingProps) {
    let workInProgress2 = current.alternate;
    if (workInProgress2 === null) {
      workInProgress2 = createFiber(current.tag, pendingProps);
      workInProgress2.elementType = current.elementType;
      workInProgress2.type = current.type;
      workInProgress2.stateNode = current.stateNode;
      workInProgress2.alternate = current;
      current.alternate = workInProgress2;
    }
    workInProgress2.child = current.child;
    workInProgress2.sibling = current.sibling;
    workInProgress2.index = current.index;
    workInProgress2.memoizedProps = current.memoizedProps;
    workInProgress2.memoizedState = current.memoizedState;
    workInProgress2.updateQueue = current.updateQueue;
    return workInProgress2;
  }
  function createFiberFromElement(element) {
    const { type, key } = element;
    let pendingProps = element.props;
    const fiber = createFiberFromTypeAndProps(type, key, pendingProps);
    return fiber;
  }
  function createFiberFromTypeAndProps(type, key, pendingProps) {
    let fiberTag = IndeterminateComponent;
    if (isString(type)) {
      fiberTag = HostComponent;
    }
    const fiber = createFiber(fiberTag, pendingProps);
    fiber.elementType = type;
    fiber.type = type;
    return fiber;
  }

  // packages/react-reconciler/src/ReactUpdateQueue.ts
  var UpdateState = 0;
  function initializeUpdateQueue(fiber) {
    const queue = {
      baseState: fiber.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: {
        pending: null
      },
      effects: null
    };
    fiber.updateQueue = queue;
  }
  function createUpdate() {
    const update = {
      payload: null,
      callback: null,
      next: null,
      tag: UpdateState
    };
    return update;
  }
  function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    if (updateQueue === null)
      return;
    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;
    if (pending === null) {
      update.next = update;
    }
    sharedQueue.pending = update;
  }
  function processUpdateQueue(workInProgress2) {
    const queue = workInProgress2.updateQueue;
    let firstBaseUpdate = queue.firstBaseUpdate;
    let lastBaseUpdate = queue.lastBaseUpdate;
    let pendingQueue = queue.shared.pending;
    if (pendingQueue !== null) {
      queue.shared.pending = null;
      const lastPendingUpdate = pendingQueue;
      const firstPendingUpdate = lastPendingUpdate.next;
      lastPendingUpdate.next = null;
      if (lastBaseUpdate === null) {
        firstBaseUpdate = firstPendingUpdate;
      } else {
        firstBaseUpdate = lastBaseUpdate.next;
      }
      lastBaseUpdate = lastPendingUpdate;
      const current = workInProgress2.alternate;
      if (current !== null) {
        const currentQueue = current.updateQueue;
        const currentLastBaseUpdate = currentQueue.lastBaseUpdate;
        if (currentLastBaseUpdate !== lastBaseUpdate) {
          if (currentLastBaseUpdate === null) {
            currentQueue.firstBaseUpdate = firstPendingUpdate;
          } else {
            currentLastBaseUpdate.next = firstPendingUpdate;
          }
          currentQueue.lastBaseUpdate = lastPendingUpdate;
        }
      }
    }
    if (firstBaseUpdate !== null) {
      let newState = queue.baseState;
      let newLastBaseUpdate = null;
      let newFirstBaseUpdate = null;
      let newBaseState = null;
      const update = firstBaseUpdate;
      newState = getStateFromUpdate(workInProgress2, queue, update, newState);
      if (newLastBaseUpdate === null) {
        newBaseState = newState;
      }
      queue.baseState = newBaseState;
      queue.firstBaseUpdate = newFirstBaseUpdate;
      queue.lastBaseUpdate = newLastBaseUpdate;
      workInProgress2.memoizedState = newState;
    }
  }
  function getStateFromUpdate(workInProgress2, queue, update, prevState) {
    switch (update.tag) {
      case UpdateState:
        const payload = update.payload;
        let partialState = payload;
        if (partialState == null) {
          return prevState;
        }
        return assign({}, prevState, payload);
    }
  }

  // packages/react-reconciler/src/ReactFiberRoot.ts
  function createFiberRoot(containerInfo, tag, initialChildren = null) {
    const root = new FiberRootNode(containerInfo, tag);
    const uninitializedFiber = createHostRootFiber();
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    const initialState = {
      element: initialChildren
    };
    uninitializedFiber.memoizedState = initialState;
    initializeUpdateQueue(uninitializedFiber);
    return root;
  }
  var FiberRootNode = class {
    constructor(containerInfo, tag) {
      this.containerInfo = containerInfo;
      this.tag = tag;
      this.current = null;
      this.finishedWork = null;
    }
  };

  // packages/scheduler/src/SchedulerPriorities.ts
  var ImmediatePriority = 1;
  var UserBlockingPriority = 2;
  var NormalPriority = 3;
  var LowPriority = 4;
  var IdlePriority = 5;

  // packages/react-dom/src/shared/HTMLNodeType.ts
  var TEXT_NODE = 3;

  // packages/react-dom/src/client/setTextContent.ts
  var setTextContent = function(node, text) {
    if (text) {
      const firstChild = node.firstChild;
      if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
        firstChild.nodeValue = text;
        return;
      }
    }
    node.textContent = text;
  };
  var setTextContent_default = setTextContent;

  // packages/react-dom/src/client/ReactDOMComponent.ts
  var CHILDREN = "children";
  function createElement(type, props) {
    const domElement = document.createElement(type);
    return domElement;
  }
  function setInitialProperties(domElement, tag, rawProps) {
    let props = rawProps;
    setInitialDOMProperties(tag, domElement, props);
  }
  function setInitialDOMProperties(tag, domElement, nextProps) {
    for (const propKey in nextProps) {
      if (!nextProps.hasOwnProperty(propKey)) {
        continue;
      }
      const nextProp = nextProps[propKey];
      if (propKey === CHILDREN) {
        const value = isString(nextProp) ? nextProp : "" + nextProp;
        setTextContent_default(domElement, value);
      } else if (nextProp != null) {
      }
    }
  }

  // packages/react-dom/src/client/ReactDOMComponentTree.ts
  var randomKey = Math.random().toString(36).slice(2);
  var internalPropsKey = "__reactProps$" + randomKey;
  function updateFiberProps(node, props) {
    node[internalPropsKey] = props;
  }

  // packages/react-dom/src/client/ReactDOMHostConfig.ts
  function shouldSetTextContent(type, props) {
    return type === "textarea" || type === "noscript" || typeof props.children === "string" || typeof props.children === "number" || typeof props.dangerouslySetInnerHTML === "object" && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
  }
  function createInstance(type, props) {
    const domElement = createElement(type, props);
    updateFiberProps(domElement, props);
    return domElement;
  }
  function finalizeInitialChildren(domElement, type, props) {
    setInitialProperties(domElement, type, props);
  }

  // packages/shared/src/ReactSymbols.ts
  var REACT_ELEMENT_TYPE = Symbol.for("react.element");

  // packages/react-reconciler/src/ReactChildFiber.ts
  function ChildReconciler(shouldTrackSideEffects) {
    function reconcileChildFibers2(returnFiber, currentFirstChild, newChild) {
      if (isObject(newChild)) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
        }
      }
      return null;
    }
    function reconcileSingleElement(returnFiber, currentFirstChild, element) {
      let child = currentFirstChild;
      while (child !== null) {
      }
      const created = createFiberFromElement(element);
      created.return = returnFiber;
      return created;
    }
    function placeSingleChild(newFiber) {
      if (shouldTrackSideEffects && newFiber.alternate === null) {
        newFiber.flags |= Placement;
      }
      return newFiber;
    }
    return reconcileChildFibers2;
  }
  var reconcileChildFibers = ChildReconciler(true);
  var mountChildFibers = ChildReconciler(false);

  // packages/react-reconciler/src/ReactFiberHooks.ts
  function renderWithHooks(_current, workInProgress2, Component) {
    const children = Component();
    return children;
  }

  // packages/react-reconciler/src/ReactFiberBeginWork.ts
  function beginWork(current, workInProgress2) {
    if (current !== null) {
    } else {
    }
    switch (workInProgress2.tag) {
      case HostRoot: {
        return updateHostRoot(current, workInProgress2);
      }
      case IndeterminateComponent:
        return mountIndeterminateComponent(current, workInProgress2, workInProgress2.type);
      case HostComponent:
        return updateHostComponent(current, workInProgress2);
    }
    return null;
  }
  function updateHostRoot(current, workInProgress2) {
    const prevState = workInProgress2.memoizedState;
    const prevChildren = prevState.element;
    processUpdateQueue(workInProgress2);
    const nextState = workInProgress2.memoizedState;
    const nextChildren = nextState.element;
    if (nextChildren === prevChildren) {
      return null;
    }
    reconcileChildren(current, workInProgress2, nextChildren);
    return workInProgress2.child;
  }
  function reconcileChildren(current, workInProgress2, nextChildren) {
    if (current === null) {
      workInProgress2.child = mountChildFibers(workInProgress2, null, nextChildren);
    } else {
      workInProgress2.child = reconcileChildFibers(workInProgress2, current.child, nextChildren);
    }
  }
  function mountIndeterminateComponent(_current, workInProgress2, Component) {
    const value = renderWithHooks(_current, workInProgress2, Component);
    workInProgress2.tag = FunctionComponent;
    reconcileChildren(null, workInProgress2, value);
    return workInProgress2.child;
  }
  function updateHostComponent(current, workInProgress2) {
    const { type, pendingProps: nextProps } = workInProgress2;
    let nextChildren = nextProps.children;
    const isDirectTextChild = shouldSetTextContent(type, nextProps);
    if (isDirectTextChild) {
      nextChildren = null;
    } else {
    }
    reconcileChildren(current, workInProgress2, nextChildren);
    return workInProgress2.child;
  }

  // packages/react-reconciler/src/ReactFiberCommitWork.ts
  function commitMutationEffects(root, finishedWork) {
    commitMutationEffectsOnFiber(finishedWork, root);
  }
  function commitMutationEffectsOnFiber(finishedWork, root) {
    const current = finishedWork.alternate;
    switch (finishedWork.tag) {
      case HostRoot:
        commitReconciliationEffects(finishedWork);
    }
  }
  function commitReconciliationEffects(finishedWork) {
  }

  // packages/react-reconciler/src/ReactFiberCompleteWork.ts
  function completeWork(current, workInProgress2) {
    const newProps = workInProgress2.pendingProps;
    switch (workInProgress2.tag) {
      case FunctionComponent: {
        return null;
      }
      case HostRoot: {
        return null;
      }
      case HostComponent: {
        const type = workInProgress2.type;
        if (current !== null && workInProgress2 !== null) {
        } else {
          const instance = createInstance(type, newProps);
          appendAllChildren(instance, workInProgress2);
          workInProgress2.stateNode = instance;
          finalizeInitialChildren(instance, type, newProps);
        }
        return null;
      }
    }
  }
  function appendAllChildren(parent, workInProgress2) {
    const node = workInProgress2.child;
    while (node !== null) {
    }
  }

  // packages/scheduler/src/SchedulerMinHeap.ts
  function push(heap, task) {
    const index = heap.length;
    heap.push(task);
    siftUp(heap, task, index);
  }
  function peek(heap) {
    return heap.length ? heap[0] : null;
  }
  function pop(heap) {
    if (heap.length === 0) {
      return null;
    }
    const first = heap[0];
    const last = heap.pop();
    if (first !== last) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }
    return first;
  }
  function siftUp(heap, task, i) {
    let index = i;
    while (index > 0) {
      const parentIndex = index - 1 >> 1;
      const parentTask = heap[parentIndex];
      if (compare(parentTask, task) > 0) {
        heap[parentIndex] = task;
        heap[index] = parentIndex;
        index = parentIndex;
      } else {
        return;
      }
    }
  }
  function siftDown(queue, task, i) {
  }
  function compare(a, b) {
    const diff = a.sortIndex - b.sortIndex;
    return diff !== 0 ? diff : a.id - b.id;
  }

  // packages/scheduler/src/forks/Scheduler.ts
  var getCurrentTime;
  var hasPerformanceNow = typeof performance === "object" && typeof performance.now === "function";
  if (hasPerformanceNow) {
    getCurrentTime = () => performance.now();
  } else {
  }
  var IMMEDIATE_PRIORITY_TIMEOUT = -1;
  var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
  var NORMAL_PRIORITY_TIMEOUT = 5e3;
  var LOW_PRIORITY_TIMEOUT = 1e4;
  var IDLE_PRIORITY_TIMEOUT = 1073741823;
  var taskQueue = [];
  var taskIdCounter = 1;
  var isPerformingWork = false;
  var isHostCallbackScheduled = false;
  var scheduledHostCallback = null;
  var isMessageLoopRunning = false;
  function unstable_scheduleCallback(priorityLevel, callback) {
    const currentTime = getCurrentTime();
    const startTime = currentTime;
    let timeout;
    switch (priorityLevel) {
      case ImmediatePriority:
        timeout = IMMEDIATE_PRIORITY_TIMEOUT;
        break;
      case UserBlockingPriority:
        timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
        break;
      case IdlePriority:
        timeout = IDLE_PRIORITY_TIMEOUT;
        break;
      case LowPriority:
        timeout = LOW_PRIORITY_TIMEOUT;
        break;
      case NormalPriority:
        timeout = NORMAL_PRIORITY_TIMEOUT;
        break;
      default:
        timeout = NORMAL_PRIORITY_TIMEOUT;
    }
    const expirationTime = startTime + timeout;
    const newTask = {
      id: taskIdCounter++,
      callback,
      priorityLevel,
      startTime,
      expirationTime,
      sortIndex: -1
    };
    if (startTime > currentTime) {
    } else {
      newTask.sortIndex = expirationTime;
      push(taskQueue, newTask);
      if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
      }
    }
  }
  function requestHostCallback(callback) {
    scheduledHostCallback = callback;
    if (!isMessageLoopRunning) {
      isMessageLoopRunning = true;
      schedulePerformWorkUntilDeadline();
    }
  }
  var schedulePerformWorkUntilDeadline;
  if (typeof MessageChannel !== "undefined") {
    const channel = new MessageChannel();
    const port = channel.port2;
    channel.port1.onmessage = performWorkUntilDeadline;
    schedulePerformWorkUntilDeadline = () => {
      port.postMessage(null);
    };
  } else {
  }
  function flushWork() {
    isHostCallbackScheduled = false;
    isPerformingWork = true;
    return workLoop();
  }
  function performWorkUntilDeadline() {
    if (scheduledHostCallback !== null) {
      let hasMoreWork = true;
      try {
        hasMoreWork = scheduledHostCallback();
      } finally {
        if (hasMoreWork) {
        } else {
          isMessageLoopRunning = false;
          scheduledHostCallback = null;
        }
      }
    } else {
      isMessageLoopRunning = false;
    }
  }
  function workLoop() {
    let currentTask = peek(taskQueue);
    while (currentTask !== null) {
      const callback = currentTask.callback;
      if (typeof callback === "function") {
        currentTask.callback = null;
        callback();
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
      currentTask = peek(taskQueue);
    }
  }

  // packages/react-reconciler/src/Scheduler.ts
  var scheduleCallback = unstable_scheduleCallback;

  // packages/react-reconciler/src/ReactFiberWorkLoop.ts
  var workInProgressRoot = null;
  var workInProgress = null;
  function scheduleUpdateOnFiber(fiber) {
    const root = fiber.stateNode;
    ensureRootIsScheduled(root);
  }
  function ensureRootIsScheduled(root) {
    let newCallbackNode;
    let schedulerPriorityLevel = NormalPriority;
    newCallbackNode = scheduleCallback(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root));
    root.callbackNode = newCallbackNode;
  }
  function performConcurrentWorkOnRoot(root) {
    renderRootSync(root);
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    finishConcurrentRender(root);
  }
  function renderRootSync(root) {
    if (workInProgressRoot !== root) {
      prepareFreshStack(root);
    }
    workLoopSync();
    workInProgressRoot = null;
  }
  function prepareFreshStack(root) {
    root.finishedWork = null;
    workInProgressRoot = root;
    const rootWorkInProgress = createWorkInProgress(root.current, null);
    workInProgress = rootWorkInProgress;
    return workInProgressRoot;
  }
  function finishConcurrentRender(root) {
    console.log(root);
    commitRoot(root);
  }
  function commitRoot(root) {
    commitRootImpl(root);
  }
  function commitRootImpl(root) {
    let finishedWork = root.finishedWork;
    root.finishedWork = null;
    root.callbackNode = null;
    commitMutationEffects(root, finishedWork);
  }
  function workLoopSync() {
    while (workInProgress !== null) {
      performUnitOfWork(workInProgress);
    }
  }
  function performUnitOfWork(unitOfWork) {
    const current = unitOfWork.alternate;
    let next = null;
    next = beginWork(current, unitOfWork);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    if (next == null) {
      completeUnitOfWork(unitOfWork);
      workInProgress = null;
    } else {
      workInProgress = next;
    }
  }
  function completeUnitOfWork(unitOfWork) {
    let completedWork = unitOfWork;
    do {
      const current = completedWork.alternate;
      const returnFiber = completedWork.return;
      let next;
      next = completeWork(current, completedWork);
      const siblingFiber = completedWork.sibling;
      if (siblingFiber !== null) {
        workInProgress = next;
        return;
      }
      completedWork = returnFiber;
      workInProgress = completedWork;
    } while (completedWork !== null);
  }

  // packages/react-reconciler/src/ReactFiberReconciler.old.ts
  function createContainer(containerInfo, tag) {
    return createFiberRoot(containerInfo, tag);
  }
  function updateContainer(element, container) {
    const current = container.current;
    const update = createUpdate();
    update.payload = { element };
    enqueueUpdate(current, update);
    const root = scheduleUpdateOnFiber(current);
  }

  // packages/react-reconciler/src/ReactFiberReconciler.ts
  var createContainer2 = createContainer;

  // packages/react-reconciler/src/ReactRootTags.ts
  var ConcurrentRoot = 1;

  // packages/react-dom/src/client/ReactDOMRoot.ts
  function createRoot(container) {
    const root = createContainer2(container, ConcurrentRoot);
    return new ReactDOMRoot(root);
  }
  var ReactDOMRoot = class {
    constructor(internalRoot) {
      this._internalRoot = internalRoot;
    }
    render(children) {
      const root = this._internalRoot;
      updateContainer(children, root);
    }
  };

  // packages/react-dom/src/client/ReactDOM.ts
  function createRoot2(container) {
    return createRoot(container);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=simplify-react-dom.global.js.map

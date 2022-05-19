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

  // packages/react-reconciler/src/ReactWorkTags.ts
  var HostRoot = 3;

  // packages/react-reconciler/src/ReactFiber.old.ts
  function createHostRootFiber() {
    return createFiber(HostRoot);
  }
  function createFiber(tag) {
    return new FiberNode(tag);
  }
  var FiberNode = class {
    constructor(tag) {
      this.tag = tag;
      this.type = null;
      this.stateNode = null;
      this.return = null;
      this.sibling = null;
      this.child = null;
      this.index = 0;
      this.alternate = null;
    }
  };

  // packages/react-reconciler/src/ReactFiberRoot.old.ts
  function createFiberRoot(containerInfo, tag) {
    const root = new FiberRootNode(containerInfo, tag);
    const uninitializedFiber = createHostRootFiber();
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    return root;
  }
  var FiberRootNode = class {
    constructor(containerInfo, tag) {
      this.containerInfo = containerInfo;
      this.current = null;
      this.tag = tag;
      this.finishedWork = null;
    }
  };

  // packages/scheduler/src/SchedulerPriorities.ts
  var ImmediatePriority = 1;
  var UserBlockingPriority = 2;
  var NormalPriority = 3;
  var LowPriority = 4;
  var IdlePriority = 5;

  // packages/scheduler/src/SchedulerMinHeap.ts
  function push(queue, task) {
    const index = queue.length;
    queue.push(task);
    siftUp(queue, task, index);
  }
  function siftUp(queue, task, i) {
    let index = i;
    while (index > 0) {
      const parentIndex = index - 1 >> 1;
      const parentTask = queue[parentIndex];
      if (compare(parentTask, task) > 0) {
        queue[parentIndex] = task;
        queue[index] = parentIndex;
        index = parentIndex;
      } else {
        return;
      }
    }
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
    schedulePerformWorkUntilDeadline();
  }
  var schedulePerformWorkUntilDeadline;
  function flushWork() {
  }

  // packages/react-reconciler/src/Scheduler.ts
  var scheduleCallback = unstable_scheduleCallback;

  // packages/react-reconciler/src/ReactFiberWorkLoop.old.ts
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
  }

  // packages/react-reconciler/src/ReactFiberReconciler.old.ts
  function createContainer(containerInfo, tag) {
    return createFiberRoot(containerInfo, tag);
  }
  function updateContainer(element, container) {
    const current = container.current;
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

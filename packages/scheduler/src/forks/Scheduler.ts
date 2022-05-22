/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 12:00:55
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-22 20:48:58
 */
import { peek, pop, push } from "../SchedulerMinHeap";
import {
  ImmediatePriority,
  UserBlockingPriority,
  IdlePriority,
  LowPriority,
  NormalPriority,
} from "../SchedulerPriorities";

let getCurrentTime;
// 是否可使用performace.now去获取高精度时间
const hasPerformanceNow =
  typeof performance === "object" && typeof performance.now === "function";

if (hasPerformanceNow) {
  getCurrentTime = () => performance.now();
} else {
  // TODO 通过 Date.now去获取时间
}

const IMMEDIATE_PRIORITY_TIMEOUT = -1; // 需要立即执行
const USER_BLOCKING_PRIORITY_TIMEOUT = 250; // 250ms 超时时间250ms，一般指的是用户交互
const NORMAL_PRIORITY_TIMEOUT = 5000; // 5000ms 超时时间5s，不需要直观立即变化的任务，比如网络请求
const LOW_PRIORITY_TIMEOUT = 10000; // 10000ms 超时时间10s，肯定要执行的任务，但是可以放在最后处理
const IDLE_PRIORITY_TIMEOUT = 1073741823; // 一些没有必要的任务，可能不会执行

// 过期任务队列
const taskQueue = [];
// 任务id
let taskIdCounter = 1;
// 标记是否正在进行任务处理，防止任务再次进入
let isPerformingWork = false;
// 是否有任务在调度
let isHostCallbackScheduled = false;
let scheduledHostCallback: null | Function = null;

// postMessage发送的消息是否正在执行
let isMessageLoopRunning = false;

/**
 * @description: 调度任务
 * @param priorityLevel 优先级
 * @param callback 需要调度的回调
 */
function unstable_scheduleCallback(priorityLevel, callback) {
  // 获取任务当前时间
  const currentTime = getCurrentTime();
  const startTime = currentTime;

  // 1、根据优先级计算超时时间
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

  // 2、计算过期时间
  const expirationTime = startTime + timeout;
  // 3、创建一个新任务
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1, // 任务排序序号，初始化-1
  };

  // TODO 如果任务开始时间大于当前时间，说明任务没有过期
  if (startTime > currentTime) {
  } else {
    // 任务开始时间<=当前时间，说明任务过期了，需要添加到taskQueue队列中以进行任务调度
    // 过期任务根据过期时间进行排序
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // 如果没有处于调度中的任务，并且workLoop没有在执行中，则向浏览器申请时间片（一帧），浏览器空闲的时候执行workLoop
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
}

/**
 * @description: 注册宏任务
 * @param callback
 */
function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

// 空闲时间进行任务调度逻辑
let schedulePerformWorkUntilDeadline;
// 利用messageChannel模拟实现requestIdleCallback
// 模拟实现requestIdleCallback的两个条件
// 1 模拟实现的requestIdleCallback能够主动让出线程，让浏览器去一些事情，例如渲染
// 2 一次事件循环中只执行一次，因为执行完一次调度任务后还会去申请下一个时间片
// 满足上述条件的只有宏任务，因为宏任务是在下一次事件循环开始的时候执行，并不会阻塞本次更新，并且宏任务在一次事件循环中也只逆行一次。

// node环境下使用setImmediate
// 浏览器和web worker环境下，这里不用setTimeout的原因是递归调用的时候，延迟最小是4ms
if (typeof MessageChannel !== "undefined") {
  const channel = new MessageChannel();
  const port = channel.port2;
  // message回调是宏任务，在下一个事件循环中执行这个回调
  channel.port1.onmessage = performWorkUntilDeadline;
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
  };
} else {
  // 使用setTimeout
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
      // 执行flushWork
      hasMoreWork = scheduledHostCallback();
    } finally {
      // TODO 如果队列中还有任务，则继续为其创建一个宏任务以继续执行
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
  // 取出当前优先级最高的任务
  let currentTask = peek(taskQueue);
  while (currentTask !== null) {
    // 获取真正的更新函数
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      currentTask.callback = null;
      callback();
      if (currentTask === peek(taskQueue)) {
        // 弹出当前执行的任务
        pop(taskQueue);
      }
    }
    // 取出下一个任务执行
    currentTask = peek(taskQueue);
  }
}

export { unstable_scheduleCallback };

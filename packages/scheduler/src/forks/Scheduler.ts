/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 12:00:55
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-19 16:20:42
 */
import { push } from "../SchedulerMinHeap";
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
// 标记是否正在进行任务处理，防止任务重复执行
let isPerformingWork = false;
// 是否有任务在调度
let isHostCallbackScheduled = false;
let scheduledHostCallback = null;

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

function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  schedulePerformWorkUntilDeadline();
}

// 空闲时间进行任务调度逻辑
let schedulePerformWorkUntilDeadline;

function flushWork() {}

export { unstable_scheduleCallback };

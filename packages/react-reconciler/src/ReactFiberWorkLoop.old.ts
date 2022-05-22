/*
 * @Author: Zhouqi
 * @Date: 2022-05-18 11:29:27
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-22 21:29:50
 */
import { NormalPriority } from "packages/scheduler/src/SchedulerPriorities";
import { createWorkInProgress } from "./ReactFiber.old";
import { commitMutationEffects } from "./ReactFiberCommitWork.old";
import { scheduleCallback } from "./Scheduler";

let workInProgressRoot = null;
let workInProgress = null;

/**
 * @description: 调度fiber节点上的更新
 * @param fiber
 */
export function scheduleUpdateOnFiber(fiber) {
  const root = fiber.stateNode;
  // 调度应用
  ensureRootIsScheduled(root);
}

/**
 * @author: Zhouqi
 * @description: 调度应用
 * @param root
 */
function ensureRootIsScheduled(root) {
  // 调度一个新的回调
  let newCallbackNode;

  // 设置任务优先级，防止浏览器因没有空闲时间导致任务卡死
  // TODO 先写死 NormalPriority
  let schedulerPriorityLevel = NormalPriority;
  // TODO 计算任务超时等级

  // 低优先级的异步更新任务走performConcurrentWorkOnRoot
  // performConcurrentWorkOnRoot在浏览器没有空闲时间的时候我执行shouldYield终止循环
  // 等浏览器有空闲时间的时候恢复执行

  // 通过scheduler去调度任务
  newCallbackNode = scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root)
  );
  root.callbackNode = newCallbackNode;
}

/**
 * @description: 所有并发任务的入口，即通过schedular调度的任务
 * @param root
 */
function performConcurrentWorkOnRoot(root) {
  renderRootSync(root);
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  finishConcurrentRender(root);
}

/**
 * @description: 同步执行根节点渲染
 * @param root
 */
function renderRootSync(root) {
  if (workInProgressRoot !== root) {
    // 为接下去新一次渲染工作初始化参数
    prepareFreshStack(root);
  }
  workLoopSync();
  // 表示render结束，没有正在进行中的render
  workInProgressRoot = null;
}

/**
 * @description: 为接下去新一次渲染工作初始化参数
 * @param root
 */
function prepareFreshStack(root) {
  root.finishedWork = null;
  workInProgressRoot = root;
  // 为当前节点创建一个内存中的fiber节点（双缓存机制）
  const rootWorkInProgress = createWorkInProgress(root.current);
  workInProgress = rootWorkInProgress;
  return workInProgressRoot;
}

function finishConcurrentRender(root) {
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

/**
 * @description: 循环同步执行任务
 */
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
    // TODO 暂时重置workInProgress以退出循环，防止调试卡死
    workInProgress = null;
  }
}

/**
 * @description: 以fiber节点为单位开始beginWork和completeWork
 * @param unitOfWork
 */
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  console.log(current);
}

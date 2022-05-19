/*
 * @Author: Zhouqi
 * @Date: 2022-05-18 11:29:27
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-19 21:47:38
 */
import { NormalPriority } from "packages/scheduler/src/SchedulerPriorities";
import { createWorkInProgress } from "./ReactFiber.old";
import { commitMutationEffects } from "./ReactFiberCommitWork.old";
import { scheduleCallback } from "./Scheduler";

let workInProgressRoot = null;
let workInProgress = null;

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
  newCallbackNode = scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root)
  );
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
}

function prepareFreshStack(root) {
  root.finishedWork = null;
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

function workLoopSync() {
  performUnitOfWork(workInProgress);
}

function performUnitOfWork(unitOfWork) {
  console.log(unitOfWork);
}

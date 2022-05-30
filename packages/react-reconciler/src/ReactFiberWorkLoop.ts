/*
 * @Author: Zhouqi
 * @Date: 2022-05-18 11:29:27
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-30 17:21:14
 */
import { NormalPriority } from "packages/scheduler/src/SchedulerPriorities";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { commitMutationEffects } from "./ReactFiberCommitWork";
import { completeWork } from "./ReactFiberCompleteWork";
import { Fiber } from "./ReactInternalTypes";
import { scheduleCallback } from "./Scheduler";

// 当前正在工作的根应用fiber
let workInProgressRoot = null;
// 当前正在工作的fiber
let workInProgress: Fiber | null = null;

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
  // 先写死NormalPriority
  let schedulerPriorityLevel = NormalPriority;
  // TODO 计算任务超时等级

  // 低优先级的异步更新任务走performConcurrentWorkOnRoot
  // performConcurrentWorkOnRoot在浏览器没有空闲时间的时候执行shouldYield终止循环
  // 等浏览器有空闲时间的时候恢复执行

  // 非同步任务通过scheduler去调度任务
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
  // todo 判断是否需要开启时间切片
  const shouldTimeSlice = false;
  shouldTimeSlice ? renderRootConcurrent(root) : renderRootSync(root);
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  finishConcurrentRender(root);
}

function renderRootConcurrent(roor) {}

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
  const rootWorkInProgress = createWorkInProgress(root.current, null);
  workInProgress = rootWorkInProgress;
  return workInProgressRoot;
}

/**
 * @description: render工作完成，进入commit阶段
 * @param root
 */
function finishConcurrentRender(root) {
  commitRoot(root);
}

/**
 * @description: 提交阶段
 * @param root
 */
function commitRoot(root) {
  commitRootImpl(root);
}

function commitRootImpl(root) {
  const finishedWork = root.finishedWork;
  root.finishedWork = null;
  // commitRoot总是同步完成的。所以我们现在可以清除这些，以允许一个新的回调被调度。
  root.callbackNode = null;

  workInProgressRoot = null;
  workInProgress = null;

  // TODO beforeMutationEffect阶段

  commitMutationEffects(root, finishedWork);

  // TODO layout阶段
}

/**
 * @description: 循环同步执行过期的任务
 */
function workLoopSync() {
  // 对于已经超时的任务，不需要检查是否需要yield，直接执行
  // 如果存在workInProgress，就执行performUnitOfWork
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

/**
 * @description: 以fiber节点为单位开始beginWork和completeWork
 * @param unitOfWork
 */
function performUnitOfWork(unitOfWork) {
  // 首屏渲染只有当前应用的根结点存在current，其它节点current为null
  const current = unitOfWork.alternate;
  let next;
  next = beginWork(current, unitOfWork);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  // 不存在子fiber节点了，说明节点已经处理完，此时进入completeWork
  if (next == null) {
    completeUnitOfWork(unitOfWork);
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

    // 处理当前节点的兄弟节点
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = next;
      return;
    }

    // returnFiber的子节点已经全部处理完毕，开始处理returnFiber
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}

/*
 * @Author: Zhouqi
 * @Date: 2022-05-18 11:29:27
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-14 14:42:02
 */
import type { Fiber, FiberRoot } from "./ReactInternalTypes";
import type { Lane, Lanes } from "./ReactFiberLane";
import { NormalPriority } from "packages/scheduler/src/SchedulerPriorities";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { commitMutationEffects } from "./ReactFiberCommitWork";
import { completeWork } from "./ReactFiberCompleteWork";
import {
  getNextLanes,
  NoTimestamp,
  NoLane,
  mergeLanes,
  markRootUpdated,
  markStarvedLanesAsExpired,
  NoLanes,
} from "./ReactFiberLane";
import { HostRoot } from "./ReactWorkTags";
import { now, scheduleCallback } from "./Scheduler";
import { getCurrentUpdatePriority } from "./ReactEventPriorities";
import { getCurrentEventPriority } from "packages/react-dom/src/client/ReactDOMHostConfig";

// 当前正在工作的根应用fiber
let workInProgressRoot = null;
// 当前正在工作的fiber
let workInProgress: Fiber | null = null;

let currentEventTime: number = NoTimestamp;

let workInProgressRootRenderLanes: Lanes = NoLanes;

/**
 * @description: 计算事件的开始时间
 */
export function requestEventTime() {
  // 处于一个浏览器事件中产生的任务应该具有相同开始时间，比如click事件中多次调用setState产生的事件
  if (currentEventTime !== NoTimestamp) {
    return currentEventTime;
  }
  currentEventTime = now();
  return currentEventTime;
}

/**
 * @description: 计算事件的优先级
 */
export function requestUpdateLane(fiber: Fiber): Lane {
  const updateLane = getCurrentUpdatePriority();
  if (updateLane !== NoLane) {
    return updateLane;
  }
  // 大部分事件更新产生的优先级
  const eventLane = getCurrentEventPriority();
  return eventLane;
}

/**
 * @description: 调度fiber节点上的更新
 * @param fiber
 */
export function scheduleUpdateOnFiber(fiber, lane: Lane, eventTime: number) {
  /**
   * react在render阶段从当前应用的根节点开始进行树的深度优先遍历处理，
   * 在更新的时候，当前处理的fiber节点可能不是当前应用的根节点，因此需要通过
   * markUpdateLaneFromFiberToRoot向上去查找当前应用的根节点
   */
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (root === null) {
    return null;
  }

  markRootUpdated(root, lane, eventTime);

  // 异步调度应用（concurrent模式）
  ensureRootIsScheduled(root, eventTime);
}

/**
 * @description: 将当前fiber的更新冒泡到当前应用的根节点上，冒泡过程中会更新路径上fiber的优先级
 */
function markUpdateLaneFromFiberToRoot(
  sourceFiber: Fiber,
  lane: Lane
): FiberRoot | null {
  // 更新当前fiber节点的lannes，表示当前节点需要更新
  sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
  let alternate = sourceFiber.alternate;

  // alternate存在表示更新阶段，需要同步更新alternate上的lanes
  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }

  // 从当前需要更新的fiber节点向上遍历，遍历到根节点（root fiber）并更新每个fiber节点上的childLanes属性
  let node = sourceFiber;
  let parent = sourceFiber.return;
  while (parent !== null) {
    // 收集需要更新的子节点的lane，存放在父fiber上的childLanes上，childLanes有值表示当前节点下有子节点需要更新
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;
    // 同步更新alternate上的childLanes
    if (alternate !== null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    }

    node = parent;
    parent = parent.return;
  }
  if (node.tag === HostRoot) {
    return node.stateNode;
  } else {
    return null;
  }
}

/**
 * @author: Zhouqi
 * @description: 调度应用
 * @param root
 */
function ensureRootIsScheduled(root: FiberRoot, eventTime: number) {
  const existingCallbackNode = root.callbackNode;

  // 判读某些lane上的任务是否已经过期，过期的话就标记为过期，然后接下去就可以执行它们
  markStarvedLanesAsExpired(root, eventTime);

  // 获取优先级最高的任务的优先级
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  );

  console.log(nextLanes);

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

    if (next !== null) {
      workInProgress = next;
      return;
    }

    // 处理当前节点的兄弟节点
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    // returnFiber的子节点已经全部处理完毕，开始处理returnFiber
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}

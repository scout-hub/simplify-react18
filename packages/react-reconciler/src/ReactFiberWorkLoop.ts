/*
 * @Author: Zhouqi
 * @Date: 2022-05-18 11:29:27
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-25 20:38:32
 */
import type { Fiber, FiberRoot } from "./ReactInternalTypes";
import {
  getHighestPriorityLane,
  includesBlockingLane,
  includesExpiredLane,
  includesSomeLane,
  Lane,
  Lanes,
  markRootFinished,
  SyncLane,
} from "./ReactFiberLane";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import {
  commitMutationEffects,
  commitPassiveMountEffects,
} from "./ReactFiberCommitWork";
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
import {
  now,
  scheduleCallback,
  cancelCallback,
  ImmediatePriority as ImmediateSchedulerPriority,
  UserBlockingPriority as UserBlockingSchedulerPriority,
  NormalPriority as NormalSchedulerPriority,
  IdlePriority as IdleSchedulerPriority,
  shouldYield,
} from "./Scheduler";
import {
  ContinuousEventPriority,
  DefaultEventPriority,
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  IdleEventPriority,
  lanesToEventPriority,
  setCurrentUpdatePriority,
} from "./ReactEventPriorities";
import {
  getCurrentEventPriority,
  scheduleMicrotask,
} from "packages/react-dom/src/client/ReactDOMHostConfig";
import {
  flushSyncCallbacks,
  scheduleSyncCallback,
} from "./ReactFiberSyncTaskQueue";
import { MutationMask, NoFlags, PassiveMask } from "./ReactFiberFlags";

type RootExitStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const RootInProgress = 0;
const RootCompleted = 5;

// 当前正在工作的根应用fiber
let workInProgressRoot: FiberRoot | null = null;
// 当前正在工作的fiber
let workInProgress: Fiber | null = null;

let currentEventTime: number = NoTimestamp;

let workInProgressRootRenderLanes: Lanes = NoLanes;
let workInProgressRootExitStatus: RootExitStatus = RootInProgress;

// 待执行的useEffect
let rootWithPendingPassiveEffects: FiberRoot | null = null;
let rootDoesHavePassiveEffects: boolean = false;

export let subtreeRenderLanes: Lanes = NoLanes;

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
   * markUpdateLaneFromFiberToRoot向上去查找当前应用的根节点，同时对查找路径上的
   * fiber进行lane的更新
   */
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (root === null) {
    return null;
  }

  // 给root节点加上更新标记，pendingLanes
  markRootUpdated(root, lane, eventTime);

  // 调度应用
  ensureRootIsScheduled(root, eventTime);

  return root;
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
  // 这样就可以通过父节点的childLanes来知道子树所有Update的lanes，不需要遍历子树
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

  // 判读某些lane上的任务是否已经过期，过期的话就标记为过期，然后接下去就可以用同步的方式执行它们（解决饥饿问题）
  markStarvedLanesAsExpired(root, eventTime);

  // 获取优先级最高的任务（有没有任务需要调度）
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  );

  // 如果nextLanes为空则表示没有任务需要执行，直接结束调度
  if (nextLanes === NoLanes) {
    // existingCallbackNode不为空表示有任务使用了concurrent模式被scheduler调用，但是还未执行
    // nextLanes为空了则表示没有任务了，就算这个任务执行了但是也做不了任何更新，所以需要取消掉
    if (existingCallbackNode !== null) {
      // 使用cancelCallback会将任务的callback置为null
      // 在scheduler循环taskQueue时，会检查当前task的callback是否为null
      // 为null则从taskQueue中删除，不会执行
      cancelCallback(existingCallbackNode);
    }
    root.callbackNode = null;
    root.callbackPriority = NoLane;
    return;
  }

  // 使用优先级最高的任务的优先级来表示回调函数的优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  const existingCallbackPriority = root.callbackPriority;

  /**
   * 与现有的任务优先级一样的情况，直接返回
   * 这就是一个onclick事件中多次setState只会触发一次更新的原因，
   * 同一优先级的Update只会被调度一次（复用），而所有产生的Update已经通过链表的形式存储在queue.pending中，
   * 这些Update在后续调度过程中一起调度即可
   */
  if (existingCallbackPriority === newCallbackPriority) {
    return;
  }

  // 走到这儿说明新任务的优先级大于现有任务的优先级，如果存在现有任务则取消现有的任务的执行（高优先级打断低优先级）
  if (existingCallbackNode != null) {
    cancelCallback(existingCallbackNode);
  }

  // 调度一个新的回调
  let newCallbackNode;
  if (newCallbackPriority === SyncLane) {
    // 同步任务的更新
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    // 注册一个微任务
    scheduleMicrotask(flushSyncCallbacks);
    newCallbackNode = null;
  } else {
    // 设置任务优先级，防止浏览器因没有空闲时间导致任务卡死
    let schedulerPriorityLevel;
    // 计算任务超时等级
    // lanesToEventPriority函数将lane的优先级转换为React事件的优先级，然后再根据React事件的优先级转换为Scheduler的优先级
    switch (lanesToEventPriority(nextLanes)) {
      case DiscreteEventPriority:
        schedulerPriorityLevel = ImmediateSchedulerPriority;
        break;
      case ContinuousEventPriority:
        schedulerPriorityLevel = UserBlockingSchedulerPriority;
        break;
      case DefaultEventPriority:
        schedulerPriorityLevel = NormalSchedulerPriority;
        break;
      case IdleEventPriority:
        schedulerPriorityLevel = IdleSchedulerPriority;
        break;
      default:
        schedulerPriorityLevel = NormalSchedulerPriority;
        break;
    }
    // 低优先级的异步更新任务走performConcurrentWorkOnRoot
    // performConcurrentWorkOnRoot在浏览器没有空闲时间的时候执行shouldYield终止循环
    // 等浏览器有空闲时间的时候恢复执行

    // 非同步任务通过scheduler去调度任务
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      // 绑定上当前的root
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }

  root.callbackNode = newCallbackNode;
  root.callbackPriority = newCallbackPriority;
}

/**
 * @description: 不通过Schedular调度的同步任务的入口
 */
function performSyncWorkOnRoot(root: FiberRoot) {
  let lanes = getNextLanes(root, NoLanes);
  // 没有同步的任务了，则直接返回
  if (!includesSomeLane(lanes, SyncLane)) return null;

  renderRootSync(root, lanes);

  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;

  commitRoot(root);
  return null;
}

/**
 * @description: 所有并发任务的入口，即通过schedular调度的任务
 * @param root
 */
function performConcurrentWorkOnRoot(root: FiberRoot, didTimeout: boolean) {
  // 这里进入了react中的事件，这里可以把currentEventTime清除了，下一次更新的时候会重新计算
  currentEventTime = NoTimestamp;

  const originalCallbackNode = root.callbackNode;

  // 获取下一个优先级最高的任务
  const lanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  );

  // 没有任务了直接返回
  if (lanes === NoLanes) {
    return null;
  }

  // 判断是否需要开启时间切片 1、是否有阻塞 2、任务是否过期，过期了需要尽快执行（同步）
  const shouldTimeSlice = true;
  // !includesBlockingLane(root, lanes) &&
  // !includesExpiredLane(root, lanes) &&
  // !didTimeout;
  const exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)
    : renderRootSync(root, lanes);
  if (exitStatus !== RootInProgress) {
    if (exitStatus === RootCompleted) {
      const finishedWork = root.current.alternate;
      root.finishedWork = finishedWork;
      root.finishedLanes = lanes;
      finishConcurrentRender(root, exitStatus);
    }
  }

  /**
   * 说明本次调度的回调任务被中断了，这时需要返回performConcurrentWorkOnRoot，以延续之前中断的任务
   *
   * 这两个值不想等的情况：
   * 1、任务顺利调度完了，root.callbackNode会变成null
   * 2、有高优先级任务打断了低优先级任务 TODO
   */
  if (root.callbackNode === originalCallbackNode) {
    return performConcurrentWorkOnRoot.bind(null, root);
  }

  return null;
}

/**
 * @description: 并发模式下渲染根应用
 */
function renderRootConcurrent(root, lanes: Lanes) {
  // 如果根应用节点或者优先级改变，则创建一个新的workInProgress
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    // 为接下去新一次渲染工作初始化参数
    prepareFreshStack(root, lanes);
  }
  do {
    try {
      workLoopConcurrent();
      break;
    } catch (e: any) {
      throw Error(e);
    }
  } while (true);

  /**
   * 如果workInProgress还存在，说明任务可能被中断了
   * 即在处理当前这个workInProgress fiber的时候，游览器没有空闲时间了，此时会中断workLoopConcurrent的循环
   * workInProgress保留当前被中断的fiber，下一次要恢复这个workInProgress fiber的执行
   */
  if (workInProgress !== null) {
    // 可能是因为中断了进入了这里
    return RootInProgress;
  } else {
    workInProgressRoot = null;
    workInProgressRootRenderLanes = NoLanes;
    return workInProgressRootExitStatus;
  }
}

/**
 * @description: 并发模式调度
 */
function workLoopConcurrent() {
  // 留给react render的时间片不够就会中断render
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

/**
 * @description: 同步执行渲染工作
 * @param root
 */
function renderRootSync(root: FiberRoot, lanes: Lanes) {
  // 根应用节点或者优先级改变，优先级改变是因为高优先级任务的插入打断了上一次低优先级任务的执行
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    // 为接下去新一次渲染工作初始化参数，清除上一次渲染已经产生的工作
    prepareFreshStack(root, lanes);
  }
  do {
    try {
      workLoopSync();
      break;
    } catch (error) {
      console.log(error);
    }
  } while (true);
  // 表示render结束，没有正在进行中的render
  workInProgressRoot = null;
  workInProgressRootRenderLanes = NoLanes;
  return workInProgressRootExitStatus;
}

/**
 * @description: 为接下去新一次渲染工作初始化参数并清除上一次渲染已经产生的工作
 * @param root
 */
function prepareFreshStack(root: FiberRoot, lanes: Lanes) {
  // 清除上一次渲染已经产生的工作
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  workInProgressRoot = root;
  const rootWorkInProgress = createWorkInProgress(root.current, null);
  workInProgress = rootWorkInProgress;
  // 标记当前应用的根节点正在工作
  workInProgressRootExitStatus = RootInProgress;
  workInProgressRootRenderLanes = subtreeRenderLanes = lanes;
  return workInProgressRoot;
}

/**
 * @description: render工作完成，进入commit阶段
 * @param root
 */
function finishConcurrentRender(root: FiberRoot, exitStatus: RootExitStatus) {
  switch (exitStatus) {
    case RootCompleted: {
      commitRoot(root);
      break;
    }
  }
}

/**
 * @description: 提交阶段
 * @param root
 */
function commitRoot(root: FiberRoot) {
  const previousUpdateLanePriority = getCurrentUpdatePriority();
  // 将commitRoot的优先级设置为同步执行的优先级
  setCurrentUpdatePriority(DiscreteEventPriority);
  commitRootImpl(root);
  // 还原之前的优先级
  setCurrentUpdatePriority(previousUpdateLanePriority);
  return null;
}

function commitRootImpl(root: FiberRoot) {
  // do {
  //   flushPassiveEffects();
  // } while (rootWithPendingPassiveEffects !== null);
  // 在本次commit之前先检查是否还有未执行的useEffect，如果有则去执行它们
  while (rootWithPendingPassiveEffects !== null) {
    /**
     * flushPassiveEffects也会对rootWithPendingPassiveEffects是不是为null做一次判断
     * 这里是否用while先检查rootWithPendingPassiveEffects更好？
     * 而不是不管如何都先执行一次flushPassiveEffects，再利用flushPassiveEffects函数去判断？
     */
    throw new Error("rootWithPendingPassiveEffects !== null");
    flushPassiveEffects();
  }

  const finishedWork = root.finishedWork;

  if (finishedWork === null) return;

  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  // commitRoot总是同步完成的。所以我们现在可以清除这些，以允许一个新的回调被调度。
  root.callbackNode = null;
  root.callbackPriority = NoLane;

  /**
   * 剩余需要调度的lanes为HostRoot的lanes和其子树lanes的并集，childLanes有剩余的情况：
   * 一个子树高优先级任务打断了一个低优先级的任务，低优先级任务的lanes会被保存，并且lanes会
   * 存储到父节点的childLanes属性上，我们可以通过childLanes去获取它。具体逻辑在bubbleProperties中
   */
  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  markRootFinished(root, remainingLanes);

  workInProgressRoot = null;
  workInProgress = null;

  // 处理effect副作用
  if (
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;
      // 用Scheduler调度flushPassiveEffects（在布局完成后去调度这些副作用回调）
      scheduleCallback(NormalSchedulerPriority, () => {
        flushPassiveEffects();
        return null;
      });
    }
  }

  // 判断是否需要进行工作，一般都是dom操作
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  if (subtreeHasEffects || rootHasEffect) {
    // TODO beforeMutationEffect阶段

    commitMutationEffects(root, finishedWork);

    // 渲染完成，将current指向workInProgress（双缓存机制的最后一步）
    root.current = finishedWork;

    // TODO layout阶段
  }

  // 本次提交存在副作用，在布局完成后去调度这些副作用回调
  if (rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
  }

  // commit阶段可能会产生新的更新，所以这里再调度一次
  ensureRootIsScheduled(root, now());
}

/**
 * @description: 处理effect副作用，返回是否存在副作用的标志
 */
function flushPassiveEffects() {
  if (rootWithPendingPassiveEffects !== null) {
    try {
      return flushPassiveEffectsImpl();
    } catch (error: any) {
      throw Error(error);
    }
  }
  return false;
}

function flushPassiveEffectsImpl() {
  if (rootWithPendingPassiveEffects === null) return false;
  const root = rootWithPendingPassiveEffects;
  rootWithPendingPassiveEffects = null;
  // TODO 销毁副作用
  // commitPassiveUnmountEffects(root.current)
  commitPassiveMountEffects(root, root.current);
  return true;
}

/**
 * @description: 循环同步执行过期的任务
 */
function workLoopSync() {
  // 对于已经超时（同步）的任务，不需要检查是否需要yield，直接执行
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

/**
 * @description: 以fiber节点为单位开始beginWork和completeWork
 * @param unitOfWork
 */
function performUnitOfWork(unitOfWork: Fiber) {
  // 首屏渲染只有当前应用的根结点存在current，其它节点current为null
  const current = unitOfWork.alternate;
  let next;
  next = beginWork(current, unitOfWork, subtreeRenderLanes);
  // 属性已经更新到dom上了，memoizedProps更新为pendingProps
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  // 不存在子fiber节点了，说明节点已经处理完，此时进入completeWork
  if (next == null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

/**
 * @description: completeWork
 */
function completeUnitOfWork(unitOfWork: Fiber) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return!;

    let next;
    next = completeWork(current, completedWork, subtreeRenderLanes);

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
  if (workInProgressRootExitStatus === RootInProgress) {
    // root已经工作完了
    workInProgressRootExitStatus = RootCompleted;
  }
}

/*
 * @Author: Zhouqi
 * @Date: 2022-05-26 14:43:08
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-30 16:18:56
 */
import { Lane, Lanes, NoLane } from "./ReactFiberLane";
import type { Fiber } from "./ReactInternalTypes";
import { assign, isFunction } from "packages/shared/src";
import { NoLanes } from "./ReactFiberLane";
import { Callback } from "./ReactFiberFlags";

export type Update<State> = {
  eventTime: number; // 任务时间，通过performance.now()获取的毫秒数
  lane: Lane; // 优先级
  tag: 0 | 1 | 2 | 3; // 更新类型 UpdateState | ReplaceState | ForceUpdate | CaptureUpdate
  payload: any; // 更新挂载的数据，不同类型组件挂载的数据不同。对于ClassComponent，payload为this.setState的第一个传参。对于HostRoot，payload为root.render的第一个传参。
  callback: (() => {}) | null; // 更新的回调函数 commit layout子阶段中有使用
  next: Update<State> | null; // 连接其他update，构成一个链表
};

export type SharedQueue<State> = {
  pending: Update<State> | null; // 指向Update环状链表的最后一个Update
  lanes: Lanes;
};

export type UpdateQueue<State> = {
  baseState: State; // 本次更新前该Fiber节点的state，Update基于该state计算更新后的state
  // 本次更新前该Fiber节点已保存的Update。以链表形式存在，链表头为firstBaseUpdate，链表尾为lastBaseUpdate。
  firstBaseUpdate: Update<State> | null;
  lastBaseUpdate: Update<State> | null;
  // 触发更新时，产生的Update会保存在shared.pending中形成单向环状链表。当由Update计算state时这个环会被剪开并连接在lastBaseUpdate后面。
  shared: SharedQueue<State>;
  effects: Array<Update<State>> | null; // 数组。保存update.callback !== null的Update
};

export const UpdateState = 0;

/**
 *
 * @returns update的情况
 * 1、ReactDOM.render —— HostRoot
 * 2、this.setState —— ClassComponent
 * 3、this.forceUpdate —— ClassComponent
 * 4、useState —— FunctionComponent
 * 5、useReducer —— FunctionComponent
 */

/**
 * @description: 初始化当前fiber的updateQueue
 * @param fiber
 */
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
  // 保存到fiber的updateQueue中
  fiber.updateQueue = queue;
}

/**
 * @description: 创建Update，保存更新状态相关内容的对象
 * 注：每一个fiber可能都存在多个Update的情况，这些Update通过next连接形成链表并保存在fiber的updateQueue中，
 * 比如一个class component调用多次setState就会产生多个Update
 */
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

/**
 * @description: 向当前fiber节点的updateQueue中添加Update
 */
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

export function processUpdateQueue<State>(
  workInProgress: Fiber,
  props: any,
  instance: any,
  renderLanes: Lanes
) {
  const queue: UpdateQueue<State> = workInProgress.updateQueue;

  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;

  // pending始终指向的是最后一个添加进来的Update
  let pendingQueue = queue.shared.pending;

  // 检测shared.pending是否存在进行中的update将他们转移到baseQueue
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    const lastPendingUpdate = pendingQueue;
    // 获取第一个Update
    const firstPendingUpdate = lastPendingUpdate.next;
    // pendingQueye队列是循环的。断开第一个和最后一个之间的指针，使其是非循环的
    lastPendingUpdate.next = null;
    // 将shared.pending上的update接到baseUpdate链表上
    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate;
    } else {
      firstBaseUpdate = lastBaseUpdate.next;
    }
    lastBaseUpdate = lastPendingUpdate;
    const current = workInProgress.alternate;

    // 如果current也存在，需要将current也进行同样的处理，同fiber双缓存相似

    // Fiber节点最多同时存在两个updateQueue：
    // current fiber保存的updateQueue即current updateQueue
    // workInProgress fiber保存的updateQueue即workInProgress updateQueue
    // 在commit阶段完成页面渲染后，workInProgress Fiber树变为current Fiber树，workInProgress Fiber树内Fiber节点的updateQueue就变成current updateQueue。
    if (current !== null) {
      const currentQueue = current.updateQueue;
      const currentLastBaseUpdate = currentQueue.lastBaseUpdate;

      // 如果current的updateQueue和workInProgress的updateQueue不同，则对current也进行同样的处理，用于结构共享
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
    let newLanes = NoLanes;

    let newState = queue.baseState;
    let newBaseState: State | null = null;

    let newLastBaseUpdate = null;
    let newFirstBaseUpdate = null;

    let update: Update<State> | null = firstBaseUpdate;
    // TODO 优先级调度
    do {
      newState = getStateFromUpdate(workInProgress, queue, update, newState);
      // 存在callback，则执行callback回调，比如setState第二个参数
      const callback = update.callback;
      // lane要存在，如果已经提交了，那不应该再触发回调
      if (update.lane === NoLane) {
        console.warn("update.lane === NoLane");
      }
      if (callback && update.lane !== NoLane) {
        // 标记上Callback
        workInProgress.flags |= Callback;
        const effects = queue.effects;
        // 将callback不为null的effect添加到effects中，将来统一执行副作用(update.callback)
        effects == null ? (queue.effects = [update]) : effects.push(update);
      }
      // 可能当所有的update都处理完的时候，payload的执行又产生的新的update被添加到了updateQueue.shared.pending
      // 这个时候还需要继续执行新的更新
      update = update.next;
      if (update === null) {
        pendingQueue = queue.shared.pending;
        if (pendingQueue === null) {
          break;
        } else {
          // 产生了新的更新，进行上述同样的链表操作
          const lastPendingUpdate = pendingQueue;
          const firstPendingUpdate = lastPendingUpdate.next!;
          lastPendingUpdate.next = null;
          update = firstPendingUpdate;
          queue.lastBaseUpdate = lastPendingUpdate;
          queue.shared.pending = null;
        }
      }
    } while (true);

    if (newLastBaseUpdate === null) {
      newBaseState = newState;
    }
    queue.baseState = newBaseState!;
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;
    workInProgress.memoizedState = newState;
    workInProgress.lanes = newLanes;
  }
}

/**
 * @description: 从current fiber上克隆一个updateQueue
 */
export function cloneUpdateQueue<State>(current: Fiber, workInProgress: Fiber) {
  const queue: UpdateQueue<State> = workInProgress.updateQueue;
  const currentQueue: UpdateQueue<State> = current.updateQueue;

  if (queue === currentQueue) {
    const clone: UpdateQueue<State> = {
      baseState: currentQueue.baseState,
      firstBaseUpdate: currentQueue.firstBaseUpdate,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      shared: currentQueue.shared,
      effects: currentQueue.effects,
    };
    workInProgress.updateQueue = clone;
  }
}

function getStateFromUpdate<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State
) {
  switch (update.tag) {
    case UpdateState:
      const payload = update.payload;
      const partialState = isFunction(payload) ? payload() : payload;
      if (partialState == null) {
        // 不需要更新
        return prevState;
      }
      return assign({}, prevState, payload);
  }
}

/**
 * @description: 执行updateQueue上的副作用（update的callback）
 */
export function commitUpdateQueue<State>(
  finishedWork: Fiber,
  finishedQueue: UpdateQueue<State>,
  instance: any
) {
  const effects = finishedQueue.effects;
  finishedQueue.effects = null;
  if (effects) {
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      const callback = effect.callback;
      if (callback) {
        effect.callback = null;
        isFunction(callback) && callback.call(instance);
      }
    }
  }
}

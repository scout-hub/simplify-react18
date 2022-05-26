import assign from "packages/shared/src/assign";

/*
 * @Author: Zhouqi
 * @Date: 2022-05-26 14:43:08
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-26 17:10:33
 */
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
export function initializeUpdateQueue(fiber): void {
  const queue = {
    // 本次更新前该Fiber节点的state，Update基于该state计算更新后的state
    baseState: fiber.memoizedState,
    // 本次更新前该Fiber节点已保存的Update。以链表形式存在，链表头为firstBaseUpdate，链表尾为lastBaseUpdate。
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      // 触发更新时，产生的Update会保存在shared.pending中形成单向环状链表。当由Update计算state时这个环会被剪开并连接在lastBaseUpdate后面。
      pending: null,
    },
    effects: null,
  };
  fiber.updateQueue = queue;
}

/**
 * @description: 创建Update，保存更新状态相关内容的对象
 */
export function createUpdate() {
  const update = {
    payload: null, // 更新挂载的数据，不同类型组件挂载的数据不同
    callback: null, // 更新的回调函数
    next: null, // 与其他Update连接形成链表
    tag: UpdateState, // 更新的类型
  };
  return update;
}

/**
 * @description: 向当前fiber节点的updateQueue中添加Update
 * @param fiber
 * @param update
 */
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) return;
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  // 构建循环链表
  if (pending === null) {
    update.next = update;
  }
  // shared.pending 会保证始终指向最后一个插入的update
  sharedQueue.pending = update;
}

export function processUpdateQueue(workInProgress) {
  const queue = workInProgress.updateQueue;

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
    let newState = queue.baseState;

    let newLastBaseUpdate = null;
    let newFirstBaseUpdate = null;
    let newBaseState = null;

    const update = firstBaseUpdate;
    newState = getStateFromUpdate(workInProgress, queue, update, newState);
    // TODO 多个update的情况 循环处理
    if (newLastBaseUpdate === null) {
      newBaseState = newState;
    }
    queue.baseState = newBaseState;
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;
    workInProgress.memoizedState = newState;
  }
}

function getStateFromUpdate(workInProgress, queue, update, prevState) {
  switch (update.tag) {
    case UpdateState:
      const payload = update.payload;
      let partialState = payload;
      if (partialState == null) {
        // 不需要更新
        return prevState;
      }
      return assign({}, prevState, payload);
  }
}

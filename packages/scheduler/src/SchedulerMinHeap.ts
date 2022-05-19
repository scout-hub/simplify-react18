/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 14:08:33
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-19 20:54:59
 */
// 往队列中添加任务
export function push(queue, task) {
  const index = queue.length;
  queue.push(task);
  // 队列任务排序（小顶堆）
  siftUp(queue, task, index);
}

// 获取队首任务，即高优先级任务
export function peek(queue) {
  return queue.length ? queue[0] : null;
}

// 弹出队首任务
export function pop(queue) {
  if (queue.length === 0) {
    return null;
  }
  const first = queue[0];
  const last = queue.pop();
  // 存在多个任务，通过堆排序进行下浮
  if (first !== last) {
    // 队尾元素放到队首
    queue[0] = last;
    // 进行堆排序下浮
    siftDown(queue, last, 0);
  }
  // 只有一个任务的情况，直接返回
  return first;
}

// 小顶堆构建，新添加的任务通过堆排序进行上浮
function siftUp(queue, task, i) {
  let index = i;
  // 进行堆排序
  while (index > 0) {
    // 根据完全二叉树的性质，当前如果当前节点索引为i，则它的左孩子的索引为2i+1，右孩子的索引为2i+2
    // 如果当前子节点的索引为i，则可推出父节点索引为(i-1)/2
    const parentIndex = (index - 1) >> 1;
    const parentTask = queue[parentIndex];
    // 如果父任务的优先级低于当前任务，则对父子进行调换
    if (compare(parentTask, task) > 0) {
      queue[parentIndex] = task;
      queue[index] = parentIndex;
      index = parentIndex;
    } else {
      return;
    }
  }
}

function siftDown(queue, task, i) {}

// 比较任务的先后，先根据sortIndex排序，如果一样就根据id排序
function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

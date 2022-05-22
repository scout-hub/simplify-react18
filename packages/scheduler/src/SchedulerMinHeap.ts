/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 14:08:33
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-22 20:26:26
 */
// 往队列中添加任务
export function push(heap, task) {
  const index = heap.length;
  heap.push(task);
  // 队列任务排序（小顶堆）
  siftUp(heap, task, index);
}

// 获取队首任务，即高优先级任务
export function peek(heap) {
  return heap.length ? heap[0] : null;
}

// 弹出队首任务
export function pop(heap) {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop();
  // 存在多个任务，通过堆排序进行下浮
  if (first !== last) {
    // 队尾元素放到队首
    heap[0] = last;
    // 进行堆排序下浮
    siftDown(heap, last, 0);
  }
  // 只有一个任务的情况，直接返回
  return first;
}

// 小顶堆构建，新添加的任务通过堆排序进行上浮（优先级队列）
function siftUp(heap, task, i) {
  let index = i;
  // 进行堆排序
  while (index > 0) {
    // 根据完全二叉树的性质，当前如果当前节点索引为i，则它的左孩子的索引为2i+1，右孩子的索引为2i+2
    // 如果当前子节点的索引为i，则可推出父节点索引为(i-1)/2
    const parentIndex = (index - 1) >> 1;
    const parentTask = heap[parentIndex];
    // 如果父任务的优先级低于当前任务，则对父子进行调换
    if (compare(parentTask, task) > 0) {
      heap[parentIndex] = task;
      heap[index] = parentIndex;
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

/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 14:08:33
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-15 11:53:50
 */
type Heap = Array<Node>;
type Node = {
  id: number;
  sortIndex: number;
};

// 往队列中添加任务
export function push(heap: Heap, task: Node) {
  const index = heap.length;
  heap.push(task);
  // 队列任务排序（小顶堆）
  siftUp(heap, task, index);
}

// 获取队首任务，即高优先级任务
export function peek(heap: Heap): Node | null {
  return heap.length ? heap[0] : null;
}

// 弹出队首任务
export function pop(heap: Heap): Node | null {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop()!;
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
function siftUp(heap: Heap, task: Node, i: number) {
  let index = i;
  // 进行堆排序
  while (index > 0) {
    // 根据完全二叉树的性质，如果当前节点索引为i，则它的左孩子的索引为2i+1，右孩子的索引为2i+2
    // 如果当前子节点的索引为i，则可推出父节点索引为(i-1)/2
    const parentIndex = (index - 1) >> 1;
    const parentTask = heap[parentIndex];
    // 如果父任务的优先级低于当前任务，则对父子进行调换
    if (compare(parentTask, task) > 0) {
      heap[parentIndex] = task;
      heap[index] = parentTask;
      index = parentIndex;
    } else {
      return;
    }
  }
}

/**
 * @description: 下浮操作，将当前节点下浮到合适的位置
 */
function siftDown(heap: Heap, task: Node, i: number) {
  let index = i;
  let length = heap.length;
  let halfLength = length >> 1;

  // 比较到倒数第二层，因为最后一层以及没有子树了
  while (index < halfLength) {
    // 左子节点的索引
    const leftIndex = 2 * index + 1;
    // 左子节点
    const left = heap[leftIndex];
    // 右子节点的索引
    const rightIndex = leftIndex + 1;
    // 右子节点
    const right = heap[rightIndex];

    // 先比较根和左子节点，如果左比根小（优先级高），再让左跟右比；如果根小，则根和右比
    if (compare(left, task) < 0) {
      // 如果右子节点比左更小，则直接右和根节点交换，否则左子节点和根节点交换
      if (rightIndex < length && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = task;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = task;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, task) < 0) {
      // 右比根小，则右和根交换位置
      heap[index] = right;
      heap[rightIndex] = task;
      index = rightIndex;
    } else {
      // 结束
      return;
    }
  }
}

// 比较任务的先后，先根据sortIndex排序，如果一样就根据id排序
function compare(a: Node, b: Node) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

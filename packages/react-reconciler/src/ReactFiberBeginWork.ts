/*
 * @Author: Zhouqi
 * @Date: 2022-05-25 21:10:35
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-25 21:24:59
 */
import { HostRoot } from "./ReactWorkTags";

export function beginWork(current, workInProgress) {
  // 首屏渲染只有hostRoot存在current节点，其他节点还未被创建
  // hostRoot的workInPgress树中的HostRoot是在prepareFreshStack函数中创建
  if (current !== null) {
  }
  switch (workInProgress.tag) {
    case HostRoot: {
      return updateHostRoot(current, workInProgress);
    }
  }
}

function updateHostRoot(current, workInProgress) {
  console.log(workInProgress);
}

import {
  createInstance,
  finalizeInitialChildren,
} from "packages/react-dom/src/client/ReactDOMHostConfig";
import { HostComponent } from "./ReactWorkTags";

/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:23:10
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-28 19:54:54
 */
export function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // 创建普通元素节点
    case HostComponent: {
      const type = workInProgress.type;
      if (current !== null && workInProgress !== null) {
        // 更新
      } else {
        // 创建元素
        const instance = createInstance(type, newProps);
        // 在归阶段的时候，子fiber对应的真实dom已经全部创建完毕，此时只需要
        // 将当前fiber节点的child fiber节点对应的真实dom添加到自身真实dom下
        appendAllChildren(instance, workInProgress);
        // 将stateNode指向当前创建的dom节点
        workInProgress.stateNode = instance;
        // 初始化挂载属性
        finalizeInitialChildren(instance, type, newProps);
      }
    }
  }
}

/**
 * @description: 将子fiber对应的instance追加到自身中
 * @param parent
 * @param workInProgress
 */
function appendAllChildren(parent, workInProgress) {
  const node = workInProgress.child;
  while (node !== null) {}
}

/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:23:10
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 13:56:03
 */
import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
} from "packages/react-dom/src/client/ReactDOMHostConfig";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./ReactWorkTags";

/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:23:10
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 13:22:37
 */
export function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // 函数式组件
    case FunctionComponent: {
      return null;
    }
    // 当前应用的根结点
    case HostRoot: {
      // const fiberRoot = workInProgress.stateNode;
      // console.log(fiberRoot);
      return null;
    }
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
      return null;
    }
    // 处理文本节点
    case HostText: {
      workInProgress.stateNode = createTextInstance(newProps);
      return null;
    }
  }
  return null;
}

/**
 * @description: 将子fiber对应的instance追加到自身中
 * @param parent
 * @param workInProgress
 */
function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
    }
    while (node.sibling === null) {
      // 处理父fiber
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }
    // 为兄弟fiber添加return指向父fiber
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

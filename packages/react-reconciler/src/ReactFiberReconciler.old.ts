/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 20:46:52
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-22 20:10:13
 */
import { createFiberRoot } from "./ReactFiberRoot.old";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop.old";

/**
 * @description: 创建整个应用的根节点
 * @param  containerInfo 挂载的dom节点
 * @param  tag 创建默认 concurrent
 * @return 整个应用的根结点
 */
export function createContainer(containerInfo, tag) {
  return createFiberRoot(containerInfo, tag);
}

/**
 * @description: 更新
 * @param element ReactDOM.render的第一个参数
 * @param container
 * @return {*}
 */
export function updateContainer(element, container) {
  const current = container.current;
  // 调度该fiber节点的更新
  const root = scheduleUpdateOnFiber(current);
}

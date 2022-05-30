/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 20:46:52
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-30 14:58:56
 */
import { createFiberRoot } from "./ReactFiberRoot";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { createUpdate, enqueueUpdate } from "./ReactUpdateQueue";

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
 */
export function updateContainer(element, container) {
  const current = container.current;
  // 创建更新，目前只有hostRoot使用
  const update = createUpdate();
  // 将update的payload做为需要挂载在根节点的组件
  update.payload = { element };
  // 存储更新，添加到更新队列中
  enqueueUpdate(current, update);
  // 调度该fiber节点的更新
  const root = scheduleUpdateOnFiber(current);
  if (root !== null) {
    // TODO 处理非紧急更新 
  }
}

/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 20:46:52
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-26 15:17:41
 */
import { createFiberRoot } from "./ReactFiberRoot.old";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop.old";
import { createUpdate } from "./ReactUpdateQueue";

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
  const update: any = createUpdate();
  // 将update的payload做为需要挂载在根节点的组件
  update.payload = { element };
  // 调度该fiber节点的更新
  const root = scheduleUpdateOnFiber(current);
}

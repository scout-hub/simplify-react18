/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 19:57:13
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-30 15:12:28
 */
import { createRoot as createRootImpl } from "./ReactDOMRoot";

/**
 * @author: Zhouqi
 * @description: 创建整个应用的根节点
 * @param container 挂载的容器
 * @return 整个应用的根节点
 */
export function createRoot(container: Element) {
  return createRootImpl(container);
}

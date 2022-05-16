/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 19:57:13
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-16 19:58:56
 */
import { createRoot as createRootImpl } from "./ReactDOMRoot";

/**
 * @author: Zhouqi
 * @description: 创建根节点
 * @param 容器
 * @return
 */
export function createRoot(container) {
  return createRootImpl(container);
}

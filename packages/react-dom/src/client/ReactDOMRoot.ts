/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 19:59:04
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-06-19 10:56:19
 */
import { ConcurrentRoot, updateContainer, createContainer } from "react-reconciler";
import { listenToAllSupportedEvents } from "../events/DOMPluginEventSystem";

export function createRoot(container) {
  // 创建根容器
  const root = createContainer(container, ConcurrentRoot);
  // 开启事件委托，监听root上所有的事件
  listenToAllSupportedEvents(container)
  return new ReactDOMRoot(root);
}

class ReactDOMRoot {
  public _internalRoot;
  constructor(internalRoot) {
    this._internalRoot = internalRoot;
  }

  // 通过ReactDOM.render渲染页面
  render(children) {
    const root = this._internalRoot;
    updateContainer(children, root);
  }
}

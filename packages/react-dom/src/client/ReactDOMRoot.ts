/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 19:59:04
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 10:59:28
 */
import { createContainer } from "react-reconciler";
import { updateContainer } from "react-reconciler";
import { ConcurrentRoot } from "react-reconciler";
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

  // 通过ReactDOM.render将jsx渲染到页面上
  render(children) {
    const root = this._internalRoot;
    updateContainer(children, root);
  }
}

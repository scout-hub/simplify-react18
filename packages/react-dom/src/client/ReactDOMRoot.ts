/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 19:59:04
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 14:06:05
 */
import { createContainer } from "packages/react-reconciler/src/ReactFiberReconciler";
import { updateContainer } from "packages/react-reconciler/src/ReactFiberReconciler";
import { ConcurrentRoot } from "packages/react-reconciler/src/ReactRootTags";
import { listenToAllSupportedEvents } from "../events/DOMPluginEventSystem";

export function createRoot(container) {
  // 创建根容器
  const root = createContainer(container, ConcurrentRoot);
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

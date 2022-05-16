/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 19:59:04
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-16 22:24:15
 */
import { createContainer } from "packages/react-reconciler/src/ReactFiberReconciler";
import { ConcurrentRoot } from "packages/react-reconciler/src/ReactRootTags";

export function createRoot(container) {
  // 创建根容器
  const root = createContainer(container, ConcurrentRoot);
  return new ReactDOMRoot(root);
}

class ReactDOMRoot {
  public _internalRoot;
  constructor(internalRoot) {
    this._internalRoot = internalRoot;
  }
}

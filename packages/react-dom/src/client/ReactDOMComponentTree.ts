/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:40:26
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 10:54:51
 */
import type { Fiber } from "react-reconciler";

const randomKey = Math.random().toString(36).slice(2);
const internalPropsKey = "__reactProps$" + randomKey;
const internalInstanceKey = "__reactFiber$" + randomKey;

export function updateFiberProps(node, props) {
  node[internalPropsKey] = props;
}

export function precacheFiberNode(hostInst: Fiber, node): void {
  node[internalInstanceKey] = hostInst;
}

/**
 * @description: 根据node找到fiber节点
 */
export function getClosestInstanceFromNode(targetNode: Fiber) {
  let targetInst = targetNode[internalInstanceKey];
  if (targetInst) {
    return targetInst;
  }
}

/**
 * @description: 根据node节点获取props
 * @param node
 */
export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null;
}

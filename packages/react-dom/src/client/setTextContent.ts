/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 20:06:48
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-28 20:12:46
 */
import { TEXT_NODE } from "../shared/HTMLNodeType";

/**
 * @description: 为节点设置textContent的时候，在更新文本的情况下设置节点的nodeValue要比设置textContent要来的快
 * 因为textContent会删除节点再重新创建
 * @param {Element} node
 * @param {string} text
 */
const setTextContent = function (node: Element, text: string): void {
  if (text) {
    const firstChild = node.firstChild;
    // 判断是否是唯一文本子节点
    if (
      firstChild &&
      firstChild === node.lastChild &&
      firstChild.nodeType === TEXT_NODE
    ) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
};

export default setTextContent;

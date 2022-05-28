/*
 * @Author: Zhouqi
 * @Date: 2022-05-28 19:40:26
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-28 19:42:28
 */
const randomKey = Math.random().toString(36).slice(2);
const internalPropsKey = "__reactProps$" + randomKey;

export function updateFiberProps(node, props) {
  node[internalPropsKey] = props;
}

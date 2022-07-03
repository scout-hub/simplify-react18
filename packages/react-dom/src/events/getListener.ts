/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 17:40:11
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 11:01:24
 */
import { Fiber } from "react-reconciler";
import { getFiberCurrentPropsFromNode } from "../client/ReactDOMComponentTree";

export default function getListener(inst: Fiber, registrationName: string) {
  const stateNode = inst.stateNode;
  if (stateNode === null) {
    return null;
  }
  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) {
    return null;
  }
  const listener = props[registrationName];
  return listener;
}

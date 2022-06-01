/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 16:03:37
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 16:03:48
 */
import { TEXT_NODE } from "../shared/HTMLNodeType";

function getEventTarget(nativeEvent) {
  let target = nativeEvent.target || nativeEvent.srcElement || window;
  return target.nodeType === TEXT_NODE ? target.parentNode : target;
}

export default getEventTarget;

/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 20:46:52
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-17 20:42:41
 */
import { createFiberRoot } from "./ReactFiberRoot.old";

export function createContainer(containerInfo, tag) {
  return createFiberRoot(containerInfo, tag);
}

export function updateContainer(element, container) {
  console.log(element, container);
}

/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 20:46:52
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-18 11:28:49
 */
import { createFiberRoot } from "./ReactFiberRoot.old";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop.old";

export function createContainer(containerInfo, tag) {
  return createFiberRoot(containerInfo, tag);
}

export function updateContainer(element, container) {
  const current = container.current;
  const root = scheduleUpdateOnFiber(current);
}

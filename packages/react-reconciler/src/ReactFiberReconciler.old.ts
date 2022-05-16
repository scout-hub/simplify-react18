/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 20:46:52
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-16 21:41:56
 */
import { createFiberRoot } from "./ReactFiberRoot.old";

export function createContainer(containerInfo, tag) {
  return createFiberRoot(containerInfo, tag);
}

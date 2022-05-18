/*
 * @Author: Zhouqi
 * @Date: 2022-05-18 11:29:27
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-18 20:10:20
 */
export function scheduleUpdateOnFiber(fiber) {
  const root = fiber.stateNode;
  ensureRootIsScheduled(root);
}

/**
 * @author: Zhouqi
 * @description: 
 * 为根应用安排调度任务，每一个根应用只能有一个调用任务，在每次更新时（任务结束之前）都会调用
 * @param root
 */
function ensureRootIsScheduled(root) {
    return root
}

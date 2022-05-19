/*
 * @Author: Zhouqi
 * @Date: 2022-05-18 11:29:27
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-19 12:03:27
 */
import { scheduleCallback } from "./Scheduler";

export function scheduleUpdateOnFiber(fiber) {
  const root = fiber.stateNode;
  // 调度应用
  ensureRootIsScheduled(root);
}

/**
 * @author: Zhouqi
 * @description: 调度应用
 * @param root
 */
function ensureRootIsScheduled(root) {
  // 调度一个新的回调
  let newCallbackNode;
  // 设置任务优先级，防止浏览器因没有空闲时间导致任务卡死
  let schedulerPriorityLevel;
  newCallbackNode = scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root)
  );
  return root;
}

function performConcurrentWorkOnRoot(root) {}

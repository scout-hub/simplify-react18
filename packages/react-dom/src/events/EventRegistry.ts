/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 14:15:46
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 14:41:54
 */
import type { DOMEventName } from "./DOMEventNames";

export const allNativeEvents: Set<DOMEventName> = new Set();
export const registrationNameDependencies = {};

export function registerDirectEvent(
  registrationName: string,
  dependencies: Array<DOMEventName>
) {
  if (registrationNameDependencies[registrationName]) {
    return;
  }
  registrationNameDependencies[registrationName] = dependencies;
  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]);
  }
}

export function registerTwoPhaseEvent(
  registrationName: string,
  dependencies: Array<DOMEventName>
): void {
  // 冒泡事件
  registerDirectEvent(registrationName, dependencies);
  // 捕获事件
  // registerDirectEvent(registrationName + "Capture", dependencies);
}

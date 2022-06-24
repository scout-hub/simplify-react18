/*
 * @Author: Zhouqi
 * @Date: 2022-06-11 20:11:17
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-24 16:40:22
 */
import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}

export function useState(initialState) {
  const dispatcher = resolveDispatcher()!;
  return dispatcher.useState(initialState);
}

export function useEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  const dispatcher = resolveDispatcher()!;
  return dispatcher.useEffect(create, deps);
}

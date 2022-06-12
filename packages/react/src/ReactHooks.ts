/*
 * @Author: Zhouqi
 * @Date: 2022-06-11 20:11:17
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-12 18:06:11
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

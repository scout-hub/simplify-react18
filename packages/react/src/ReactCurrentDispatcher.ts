/*
 * @Author: Zhouqi
 * @Date: 2022-06-11 20:21:33
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 10:51:53
 */
import type { Dispatcher } from "react-reconciler";

const ReactCurrentDispatcher: { current: null | Dispatcher } = {
  current: null,
};

export default ReactCurrentDispatcher;

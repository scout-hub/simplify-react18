/*
 * @Author: Zhouqi
 * @Date: 2022-06-11 20:21:33
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-12 14:30:48
 */
import { Dispatcher } from "packages/react-reconciler/src/ReactInternalTypes";

const ReactCurrentDispatcher: { current: null | Dispatcher } = {
  current: null,
};
export default ReactCurrentDispatcher;

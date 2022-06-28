/*
 * @Author: Zhouqi
 * @Date: 2022-06-28 09:55:28
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-28 10:16:26
 */
import { REACT_MEMO_TYPE } from "packages/shared/src/ReactSymbols";

export function memo(
  type,
  compare?: (oldProps: any, newProps: any) => boolean
) {
  // 包装了一个新的组件对象React.memo
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare,
  };
  return elementType;
}

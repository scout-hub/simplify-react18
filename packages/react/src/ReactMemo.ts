/*
 * @Author: Zhouqi
 * @Date: 2022-06-28 09:55:28
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 10:49:20
 */
import { REACT_MEMO_TYPE } from "shared";

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

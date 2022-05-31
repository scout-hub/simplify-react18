/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 14:45:26
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 15:32:34
 */
export function renderWithHooks(_current, workInProgress, Component) {
  const children = Component();
  // console.log(children);
  return children;
}

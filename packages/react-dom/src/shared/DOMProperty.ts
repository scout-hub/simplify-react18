/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 15:43:06
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 16:07:15
 */
// react中使用的属性，并不能在dom上直接使用
const reservedProps = new Set([
  "children",
  "dangerouslySetInnerHTML",
  "defaultValue",
  "defaultChecked",
  "innerHTML",
  "suppressContentEditableWarning",
  "suppressHydrationWarning",
  "style",
]);

// react中重命名的属性
const renamedProps = new Map([["className", "class"]]);

/**
 * @description: 获取属性新消息
 * @param {string} name
 */
export function getPropertyInfo(name: string) {
  return renamedProps.get(name) || name;
}

/**
 * @description: 需要被忽略的属性，这些属性不能作为dom的属性
 * @param {string} name
 */
export function shouldIgnoreAttribute(name: string): boolean {
  if (reservedProps.has(name)) return true;
  if (
    name.length > 2 &&
    (name[0] === "o" || name[0] === "O") &&
    (name[1] === "n" || name[1] === "N")
  ) {
    return true;
  }
  return false;
}

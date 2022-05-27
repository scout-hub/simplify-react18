/*
 * @Author: Zhouqi
 * @Date: 2022-05-27 15:44:53
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-27 15:47:40
 */
/**
 * 判断该节点的children是否可以直接作为文本子节点
 */
export function shouldSetTextContent(type, props) {
  return (
    type === "textarea" ||
    type === "noscript" ||
    typeof props.children === "string" ||
    typeof props.children === "number" ||
    (typeof props.dangerouslySetInnerHTML === "object" &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}

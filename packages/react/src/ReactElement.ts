/*
 * @Author: Zhouqi
 * @Date: 2022-05-15 20:14:41
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-19 11:46:35
 */
import { REACT_ELEMENT_TYPE } from "packages/shared/src/ReactSymbols";
import ReactCurrentOwner from "./ReactCurrentOwner";

/**
 * @author: Zhouqi
 * @description: 创建元素的虚拟节点（jsx编译===>React.createElement）
 * @param 节点类型
 * @param 属性
 * @param 子节点
 * @return 元素虚拟节点
 */
export function createElement(type, config, children) {
  const props: any = {};

  let key: string | null = null;
  let ref = null;
  let self = null;
  let source = null;

  // 解析属性
  if (config != null) {
    if (hasValidKey(config)) {
      key = "" + config.key;
    }

    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        props[key] = config[key];
      }
    }
  }

  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    // 只有一个子节点的情况
    props.children = children;
  } else {
    // 多个子节点的情况
    const childArray = new Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
}

const ReactElement = function (type, key, ref, self, source, owner, props) {
  const element = {
    // 表示一个合法的react element
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    _owner: owner,
  };

  return element;
};

/**
 * @description: 是否是有效的key
 */
const hasValidKey = (config) => config.key !== undefined;

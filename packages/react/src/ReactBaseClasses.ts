/*
 * @Author: Zhouqi
 * @Date: 2022-06-18 20:49:05
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-29 10:00:57
 */
function Component(this: any, props) {
  this.props = props;
}

// 标记是不是react class component
Component.prototype.isReactComponent = {};

export { Component };

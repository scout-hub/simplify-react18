/*
 * @Author: Zhouqi
 * @Date: 2022-06-18 20:49:05
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-30 14:46:19
 */
class Component {
  public isReactComponent;
  public updater;
  constructor(public props) {}

  setState(partialState, callback) {
    this.updater.enqueueSetState(this, partialState, callback);
  }
}

// 标记是不是react class component
Component.prototype.isReactComponent = {};

export { Component };

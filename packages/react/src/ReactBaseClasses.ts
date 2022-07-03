/*
 * @Author: Zhouqi
 * @Date: 2022-06-18 20:49:05
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 10:45:48
 */
import { assign } from "shared";
class Component {
  public isReactComponent;
  public updater;
  constructor(public props) {}

  setState(partialState, callback) {
    this.updater.enqueueSetState(this, partialState, callback);
  }
}

// 标记是不是react class component
Component.prototype.isReactComponent = true;
class PureComponent {
  public updater;
  public isPureReactComponent;
  constructor(public props) {}
}

const pureComponentPrototype = (PureComponent.prototype = Object.create(
  Component.prototype
));

pureComponentPrototype.constructor = PureComponent;

// 将Component原型上的属性方法合并过来，减少通过原型链去访问的开销
assign(pureComponentPrototype, Component.prototype);

// 标记是不是react class pureComponent
pureComponentPrototype.isPureReactComponent = true;

export { Component, PureComponent };

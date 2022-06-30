/*
 * @Author: Zhouqi
 * @Date: 2022-06-18 20:49:05
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-30 22:37:49
 */
import { assign } from "packages/shared/src";
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

class ComponentDummy {}
ComponentDummy.prototype = Component.prototype;

class PureComponent {
  public updater;
  public isPureReactComponent;
  constructor(public props) {}
}

const pureComponentPrototype = ((PureComponent.prototype as any) =
  new ComponentDummy());

pureComponentPrototype.constructor = PureComponent;

// 将Component原型上的属性方法合并过来，减少通过原型链去访问的必要性
assign(pureComponentPrototype, Component.prototype);

// 标记是不是react class pureComponent
(pureComponentPrototype as any).isPureReactComponent = true;


export { Component, PureComponent };

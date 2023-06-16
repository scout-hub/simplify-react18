/*
 * @Author: Zhouqi
 * @Date: 2022-05-16 21:41:18
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-06-15 21:18:54
 */
import {
  ClassComponent,
  Fragment,
  MemoComponent,
  WorkTag,
} from "./ReactWorkTags";
import type { Fiber } from "./ReactInternalTypes";
import type { Lanes } from "./ReactFiberLane";
import { isFunction, isObject, isString } from "shared";
import { NoFlags, StaticMask } from "./ReactFiberFlags";
import { NoLanes } from "./ReactFiberLane";
import {
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from "./ReactWorkTags";
import {
  REACT_FRAGMENT_TYPE,
  REACT_KEEP_ALIVE_TYPE,
  REACT_MEMO_TYPE,
} from "packages/shared/src/ReactSymbols";

/**
 * @description: 创建一个标记为HostRoot的fiber树根节点
 * @return fiber节点
 */
export function createHostRootFiber() {
  return createFiber(HostRoot, null, null);
}

/**
 * @description: 创建fiber节点
 * @param tag 元素类型
 * @param pendingProps 元素属性
 * @return fiber节点
 */
function createFiber(tag: WorkTag, pendingProps, key: null | string) {
  return new FiberNode(tag, pendingProps, key);
}

/**
 * Fiber类
 *
 * react中有三种数据关系：
 *
 * 1、ReactElement：即jsx经过babel转换后的数据，它描述了页面中dom的信息以及层级关系（最初dom diff应用的地方，不好控制渲染过程）
 * 2、Fiber：是reactElement的镜像（拷贝了ReactElemen上的数据）。每一个fiber即是一个节点，也是一个独立的工作单元（并发），上面记录一些其他Fiber任务的信息，
 * 例如sibling，return、child，能够知道接下去需要处理什么， 回去要处理什么（异步可中断/恢复。像函数嵌套调用一样，父函数调用子函数，子函数调用完可以回到父函数等等）。
 * 它反映了组件Diff等工作的调用关系，推进整个渲染过程。由于每一个Fiber都是独立的工作，所以非常适合做并发，因为他们之间没有依赖关系，任务可以按照不同的顺序执行，并且能保证最终结果是正确的。
 * 3、DOM：页面上实际的效果
 */
class FiberNode {
  type = null;
  elementType = null;
  stateNode = null;
  return = null;
  sibling = null;
  child = null;
  index = 0;
  updateQueue = null;
  memoizedState = null;
  memoizedProps = null;
  lanes = NoLanes;
  childLanes = NoLanes;
  flags = NoFlags;
  subtreeFlags = NoFlags;
  deletions = null;
  alternate = null;

  constructor(public tag, public pendingProps, public key) { }
}

/**
 * @description: 创建内存中的fiber，即为当前节点创建一个新的fiber节点去工作（双缓存机制）
 * @param current 当前fiber节点
 * @return 内存中的fiber树
 */
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    // 复用current的一些属性值
    workInProgress.type = current.type;
    // 重置flags、subtreeFlags、deletions
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  workInProgress.flags = current.flags & StaticMask;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;

  workInProgress.child = current.child;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;

  return workInProgress;
}

/**
 * @description: 创建元素的fiber节点
 */
export function createFiberFromElement(element: any, lanes: Lanes): Fiber {
  const { type, key, props } = element;
  const fiber = createFiberFromTypeAndProps(type, key, props, lanes);
  return fiber;
}

/**
 * @description: 根据type和props创建fiber
 */
export function createFiberFromTypeAndProps(
  type: any,
  key: any,
  pendingProps: any,
  lanes: Lanes
): Fiber {
  let fiberTag: WorkTag = IndeterminateComponent;
  if (isFunction(type)) {
    // 判断是不是class组件
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent;
    }
  } else if (isString(type)) {
    // 说明是普通元素节点
    fiberTag = HostComponent;
  } else {
    getTag: switch (type) {
      case REACT_FRAGMENT_TYPE: {
        return createFiberFromFragment(pendingProps.children, lanes, key);
      }
      default:
        if (isObject(type)) {
          switch (type.$$typeof) {
            case REACT_MEMO_TYPE:
              fiberTag = MemoComponent;
              break getTag;
            case REACT_KEEP_ALIVE_TYPE: {
              console.log(1);
            }
          }
        }
    }
  }

  const fiber = createFiber(fiberTag, pendingProps, key);
  fiber.elementType = type;
  fiber.type = type;
  fiber.lanes = lanes;
  return fiber;
}

/**
 * @description: 通过原型上的isReactComponent判断是不是class组件
 */
function shouldConstruct(Component: Function) {
  const prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

/**
 * @description: 创建文本节点对应的fiber
 */
export function createFiberFromText(content: string, lanes: Lanes): Fiber {
  const fiber = createFiber(HostText, content, null);
  fiber.lanes = lanes;
  return fiber;
}

export function createFiberFromFragment(
  elements: Element[],
  lanes: Lanes,
  key: null | string
): Fiber {
  const fiber = createFiber(Fragment, elements, key);
  fiber.lanes = lanes;
  return fiber;
}

/**
 * @description: 判断是不是简单的函数组件
 */
export function isSimpleFunctionComponent(type: any) {
  return (
    isFunction(type) &&
    !shouldConstruct(type) &&
    type.defaultProps === undefined
  );
}
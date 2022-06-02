/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 16:36:45
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-02 11:30:06
 */
import { Fiber } from "packages/react-reconciler/src/ReactInternalTypes";

function functionThatReturnsTrue() {
  return true;
}

function functionThatReturnsFalse() {
  return false;
}

// 创建事件源
function createSyntheticEvent() {
  class SyntheticBaseEvent {
    _reactName: string | null = null;
    _targetInst: Fiber | null;
    type: string;
    nativeEvent: { [propName: string]: unknown };
    target: null | EventTarget;
    isPropagationStopped: Function;

    constructor(
      reactName: string | null,
      reactEventType: string,
      targetInst: Fiber | null,
      nativeEvent: { [propName: string]: unknown },
      nativeEventTarget: null | EventTarget
    ) {
      this._reactName = reactName;
      this._targetInst = targetInst;
      this.type = reactEventType;
      this.nativeEvent = nativeEvent;
      this.target = nativeEventTarget;

      this.isPropagationStopped = functionThatReturnsFalse;
    }

    stopPropagation() {
      const event = this.nativeEvent;
      if (!event) {
        return;
      }
      if (event.stopPropagation) {
        (event.stopPropagation as Function)();
      }

      this.isPropagationStopped = functionThatReturnsTrue;
    }
  }

  return SyntheticBaseEvent;
}

export const SyntheticEvent = createSyntheticEvent();
export const SyntheticMouseEvent = createSyntheticEvent();

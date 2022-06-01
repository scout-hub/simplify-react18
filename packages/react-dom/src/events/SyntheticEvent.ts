/*
 * @Author: Zhouqi
 * @Date: 2022-06-01 16:36:45
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 16:50:58
 */
import { Fiber } from "packages/react-reconciler/src/ReactInternalTypes";

// 创建事件源
function createSyntheticEvent() {
  class SyntheticBaseEvent {
    _reactName: string | null = null;
    _targetInst: Fiber;
    type: string;
    nativeEvent: { [key: string]: unknown };
    target: null | EventTarget;

    constructor(
      reactName: string | null,
      reactEventType: string,
      targetInst: Fiber,
      nativeEvent: { [key: string]: unknown },
      nativeEventTarget: null | EventTarget
    ) {
      this._reactName = reactName;
      this._targetInst = targetInst;
      this.type = reactEventType;
      this.nativeEvent = nativeEvent;
      this.target = nativeEventTarget;

      console.log(nativeEvent);
    }
  }

  return SyntheticBaseEvent;
}

export const SyntheticEvent = createSyntheticEvent();
export const SyntheticMouseEvent = createSyntheticEvent();

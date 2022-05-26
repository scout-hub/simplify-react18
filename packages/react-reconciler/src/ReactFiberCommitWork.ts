import { HostRoot } from "./ReactWorkTags";

/*
 * @Author: Zhouqi
 * @Date: 2022-05-19 21:24:22
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-26 15:17:28
 */
export function commitMutationEffects(root, finishedWork) {
  commitMutationEffectsOnFiber(finishedWork, root);
}

function commitMutationEffectsOnFiber(finishedWork, root) {
  const current = finishedWork.alternate;
  switch (finishedWork.tag) {
    case HostRoot:
      commitReconciliationEffects(finishedWork);
  }
}

function commitReconciliationEffects(finishedWork) {
  // console.log(finishedWork);
}

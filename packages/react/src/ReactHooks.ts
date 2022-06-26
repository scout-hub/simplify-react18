/*
 * @Author: Zhouqi
 * @Date: 2022-06-11 20:11:17
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-26 21:49:34
 */
import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

type Dispatch<A> = (A) => void;

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}

export function useState(initialState) {
  const dispatcher = resolveDispatcher()!;
  return dispatcher.useState(initialState);
}

export function useEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  const dispatcher = resolveDispatcher()!;
  return dispatcher.useEffect(create, deps);
}

export function useLayoutEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  const dispatcher = resolveDispatcher()!;
  return dispatcher.useLayoutEffect(create, deps);
}

export function useReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: (I) => S
): [S, Dispatch<A>] {
  const dispatcher = resolveDispatcher()!;
  return dispatcher.useReducer(reducer, initialArg, init);
}

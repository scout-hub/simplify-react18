/*
 * @Author: Zhouqi
 * @Date: 2022-06-30 14:47:45
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-30 14:47:51
 */
export function remove(key) {
  key._reactInternals = undefined;
}

export function get(key) {
  return key._reactInternals;
}

export function has(key) {
  return key._reactInternals !== undefined;
}

export function set(key, value) {
  key._reactInternals = value;
}

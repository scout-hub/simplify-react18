/*
 * @Author: Zhouqi
 * @Date: 2022-05-26 14:43:08
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-26 15:05:20
 */
/**
 *
 * @returns update的情况
 * 1、ReactDOM.render —— HostRoot
 * 2、this.setState —— ClassComponent
 * 3、this.forceUpdate —— ClassComponent
 * 4、useState —— FunctionComponent
 * 5、useReducer —— FunctionComponent
 */

/**
 * @description: 创建Update，保存更新状态相关内容的对象
 */
export function createUpdate() {
  const update = {
    payload: null, // 更新挂载的数据，不同类型组件挂载的数据不同
    callback: null, // 更新的回调函数
    next: null, // 与其他Update连接形成链表
    tag: null, // 更新的类型
  };
  return update;
}

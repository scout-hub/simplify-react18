/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-07-05 16:46:17
 */
const { useState } = React;

// 更新的情况
// const oldDom = (
//   <ul>
//     <li key="0" className="before">
//       0
//     </li>
//     <li key="1">1</li>
//   </ul>
// );

// 情况1 —— 节点属性变化
// const newDom = (
//   <ul>
//     <li key="0" className="after">
//       0
//     </li>
//     <li key="1">1</li>
//   </ul>
// );

// 情况2 —— 节点类型更新
// const newDom = (
//   <ul>
//     <div key="0">0</div>
//     <li key="1">1</li>
//   </ul>
// );

// 节点新增或减少
// const oldDom = (
//   <ul>
//     <li key="0">0</li>
//     <li key="1">1</li>
//   </ul>
// );

// 情况1 —— 新增节点
// const newDom = (
//   <ul>
//     <li key="0">0</li>
//     <li key="1">1</li>
//     <li key="2">2</li>
//   </ul>
// );

// 情况2 —— 删除节点
// const newDom = (
//   <ul>
//     <li key="1">1</li>
//   </ul>
// );

// 节点位置变化
const oldDom = (
  <ul>
    <li key="0">0</li>
    <li key="1">1</li>
    <li key="2">2</li>
  </ul>
);

const newDom = (
  <ul>
    <li key="2">2</li>
    <li key="1">1</li>
    <li key="0">0</li>
  </ul>
);

const App = () => {
  const [flag, setflag] = useState(true);

  return (
    <div>
      {flag ? oldDom : newDom}
      <button
        onClick={(e) => {
          setflag((flag) => !flag);
        }}
      >
        更新
      </button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

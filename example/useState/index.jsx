/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-03-15 22:33:48
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(0);
  // const [num1, setNum1] = useState(1);

  return (
    <div className="red">
      <h1>
        {num}
        {/* ===={num1} */}
      </h1>
      <button
        onClick={(e) => {
          setNum(num + 1);
          setNum(num + 2);

          // setNum((num) => num + 1);
          // setNum((num) => num + 2);

          // setNum((num) => num + 1);
          // setNum1((num) => num + 2);
        }}
      >
        计数
      </button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// mount阶段 useState
// 创建useState对应hook  绑定在当前这个函数式组件的fiber上
// hook上绑定了初始值、更新链表还有更新函数……
// 最终返回初始值还有更新函数

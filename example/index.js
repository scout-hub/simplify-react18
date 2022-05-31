/*
 * @Author: Zhouqi
 * @Date: 2022-05-17 20:09:43
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 16:30:09
 */
const { useState } = React;
const App = () => {
  const [num, setNum] = useState(0);
  return (
    <div style={{ color: "green" }}>
      <h1>{num}</h1>
      <button
        onClick={() => {
          // setNum(num + 1);
        }}
      >
        计数
      </button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

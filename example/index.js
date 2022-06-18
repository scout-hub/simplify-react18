/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-17 21:52:09
 */
const { useState } = React;
const App = () => {
  let [num, setNum] = useState(0);
  return (
    <div>
      <h1>{num}</h1>
      <button
        onClick={() => {
          // setNum(num + 1);
          // setNum(num + 2); // num = 2;

          setNum((num) => num + 1);
          setNum((num) => num + 2); // num = 3
        }}
      >
        计数
      </button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

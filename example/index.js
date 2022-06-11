/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-11 20:09:02
 */
const { useState } = React;
const App = () => {
  console.log(1);
  let [num, setNum] = useState(0);

  return (
    <div>
      <h1>{num}</h1>
      <button
        onClick={() => {
          setNum(num + 1);
        }}
      >
        计数
      </button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

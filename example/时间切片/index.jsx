/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-07-06 13:56:58
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(0);
  return (
    <div className="red">
      <input type="text" />
      <button
        onClick={() => {
          setTimeout(() => {
            setNum((num) => num + 1);
          }, 800);
        }}
      >
        更新
      </button>
      {Array.from(new Array(300000)).map((item, i) => (
        <h1 key={i}>{num}</h1>
      ))}
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-22 20:33:08
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(0);
  return (
    <div className="red">
      <input type="text" />
      <button
        id="btn1"
        onClick={() => {
          setNum((num) => num + 1);
        }}
      ></button>
      <button
        onClick={() => {
          const btn = document.getElementById("btn1");
          setTimeout(() => {
            setNum((num) => num + 2);
          }, 1000);
          setTimeout(() => {
            btn.click();
          }, 1010);
        }}
      >
        更新
      </button>
      {Array.from(new Array(100000)).map((item, i) => (
        <h1 key={i}>{num}</h1>
      ))}
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

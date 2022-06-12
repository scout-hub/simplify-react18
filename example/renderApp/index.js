/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-12 22:13:52
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(0);

  return (
    <div className="red" style={{ fontSize: 14 }}>
      <span>hello</span>
      <h1>{num}</h1>
      <span>react</span>
      <p>
        <button
          onClick={(e) => {
            setNum(num + 1);
          }}
        >
          计数
        </button>
      </p>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

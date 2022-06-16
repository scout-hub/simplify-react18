/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-16 17:46:07
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(1);

  return (
    <div className="red" style={{ fontSize: 14 }}>
      <h1>{num}</h1>
      <button
        onClick={(e) => {
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

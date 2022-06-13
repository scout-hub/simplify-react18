/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-13 20:19:54
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(1);
  
  return (
    <div className="red" style={{ fontSize: 14 }}>
      <h1>{num}</h1>
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

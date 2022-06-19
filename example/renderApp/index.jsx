/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-19 15:26:02
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(0);
  const [num1, setNum1] = useState(1);

  return (
    <div className="red">
      <h1>{num}</h1>
      <h1>{num1}</h1>
      <button
        onClick={(e) => {
          setNum((num) => num + 1);
          setTimeout(() => {
            setNum1((num1) => num1);
          }, 1000);
        }}
      >
        计数
      </button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

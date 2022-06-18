/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-18 15:27:23
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(1);

  return (
    <div className="red">
      <h1>{num}</h1>
      <button
        onClick={(e) => {
          // setNum(num + 1);
          // setNum(num + 2);

          setNum((num) => num + 1);
          setNum((num) => num + 2);
        }}
      >
        计数
      </button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

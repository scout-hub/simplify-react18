/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-20 22:44:03
 */
const { useState } = React;

const App = () => {
  const [num, setNum] = useState(0);
  return (
    <div className="red">
      <button
        onClick={() => {
          setNum((num) => {
            if (num === 0) {
              return num + 1;
            }
            return num - 1;
          });
        }}
      >
        更新
      </button>
      {num === 0
        ? Array.from(new Array(2)).map((item, i) => <h1 key={i}>{num}</h1>)
        : null}
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

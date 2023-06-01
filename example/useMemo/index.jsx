/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-04-13 20:58:42
 */
const { useState, useMemo } = React;
const set = new Set();

const App = () => {
  const [count, setCount] = useState(0);

  const id = useMemo(() => count + 1, []);
  // const id = useMemo(() => count + 1);
  // const id = useMemo(() => count + 1, [count]);
  set.add(id);
  console.log(set.size);

  return (
    <div>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        更新
      </button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

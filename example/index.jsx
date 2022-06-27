/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-27 17:27:19
 */
const { useState, useMemo } = React;

const Child = ({ count }) => {
  console.log("re-render child");
  return <div>{count}</div>;
};

const Child1 = ({ data }) => {
  console.log("re-render child1");
  return <div>{data.id}</div>;
};

const App = () => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState({ id: 1 });
  const MemoChild = useMemo(() => <Child count={count} />, [count]);
  const MemoChild1 = useMemo(() => <Child1 data={data} />, [data]);
  return (
    <div>
      {MemoChild}
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        更新child
      </button>
      {MemoChild1}
      <button
        onClick={() => {
          data.id = data.id + 1;
          setData(data);
        }}
      >
        更新child1
      </button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

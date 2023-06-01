/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-09-29 13:22:15
 */
const { useCallback, useState, memo } = React;
const set = new Set();

const Child = memo(
  () => {
    console.log(1);
    return <div>Child</div>;
  },
  (prevProps, newProps) => newProps.callback !== prevProps.callback
);

const App = () => {
  const [state, setState] = useState(0);
  // const callback = useCallback(() => {}, [state]);
  // const callback = useCallback(() => {}, []);
  const callback = useCallback(() => {});
  set.add(callback);
  console.log(set.size);
  return (
    <div>
      {state}
      <Child callback={callback} />
      <button onClick={() => setState(state + 1)}>更新</button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-27 16:46:10
 */
const { useCallback, useState } = React;
const set = new Set();

const App = () => {
  const [state, setState] = useState(0);
  // const callback = useCallback(() => {}, [state]);
  const callback = useCallback(() => {}, []);
  // const callback = useCallback(() => {});
  set.add(callback);
  // console.log(set.size);
  return (
    <div>
      {state}
      <button onClick={() => setState(state + 1)}>更新</button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

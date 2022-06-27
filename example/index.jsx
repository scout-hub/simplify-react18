/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-27 22:33:33
 */
const { useState, useMemo, useCallback } = React;

const Child = () => {
  console.log("re-render child");
  return <div>子组件</div>;
};

const App = () => {
  const [count, setCount] = useState(0);

  const userInfo = useMemo(() => ({ name: "zs", age: 14 }), []);

  const increment = () => {
    setCount(count + 1);
  };

  const onClick = useCallback((userInfo) => {
    setUserInfo(userInfo);
  }, []);

  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      {useMemo(
        () => (
          <Child userInfo={userInfo} onClick={onClick} />
        ),
        [onClick, userInfo]
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

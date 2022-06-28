/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-28 16:34:29
 */
const { useState, useMemo, useCallback, memo } = React;

const Child = memo(
  () => {
    console.log("re-render child");
    return <div>子组件</div>;
  },
  (prevProps, nextProps) => {
    // return false;
    return true;
  }
);

const App = () => {
  const [count, setCount] = useState(0);

  // const userInfo = { name: "zs", age: 14 };

  const userInfo = useMemo(() => ({ name: "zs", age: 14 }), []);

  const increment = () => {
    setCount(count + 1);
  };

  // const onClick = (userInfo) => {
  //   setUserInfo(userInfo);
  // };
  const onClick = useCallback((userInfo) => {
    setUserInfo(userInfo);
  }, []);

  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      {/* <Child /> */}
      {/* <Child count={count} /> */}
      <Child userInfo={userInfo} onClick={onClick} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-06 13:55:41
 */
const { useState, useEffect } = React;

const Child = (props) => {
  const { child } = props;
  return <p>{child}</p>;
};

const App = () => {
  const [flag, setFlag] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {});
    return () => {
      console.log(1);
      clearInterval(timer);
    };
  });

  return (
    <div>
      {flag ? <Child child="child" /> : null}
      <button onClick={() => setFlag(!flag)}>更新</button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

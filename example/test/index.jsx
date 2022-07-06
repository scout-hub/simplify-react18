/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-06 17:57:34
 */
const { useState, useEffect, createKeepAlive } = React;

const Child = (props) => {
  const { child } = props;
  return <p>{child}</p>;
};

const App = () => {
  const [flag, setFlag] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {});
    return () => {
      clearInterval(timer);
    };
  });

  return (
    <div>
      {createKeepAlive(() => {
        return flag ? <Child child="child" /> : null;
      })}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

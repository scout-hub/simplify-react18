/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-04-12 22:03:13
 */
const { useState, useEffect } = React;

const Child = () => {
  useEffect(() => {
    console.log("child");
  }, []);
  return <div>child</div>;
};

const App = () => {
  const [num, setNum] = useState(0);

  useEffect(() => {
    console.log("parent");
    const timer = setInterval(() => {
      console.log("timer");
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [num]);

  return (
    <div className="red">
      {num}
      <Child />
      <button
        onClick={(e) => {
          setNum((num) => num + 1);
        }}
      >
        计数
      </button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

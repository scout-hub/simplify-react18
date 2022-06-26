/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-26 15:58:27
 */
const { useState, useEffect } = React;
const App = () => {
  const [num, setNum] = useState(0);

  useEffect(() => {
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

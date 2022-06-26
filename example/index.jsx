/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-26 20:39:24
 */
const { useState, useEffect, useLayoutEffect } = React;

const App = () => {
  const [direction, setDirection] = useState("vertical");

  // 视图会有一个变化的过程（闪烁）
  useEffect(() => {
    let i = 0;
    while (i <= 1000000000) {
      i++;
    }
    setDirection("column");
  }, [direction]);

  // 直接呈现执行useLayoutEffect后的视图
  useLayoutEffect(() => {
    let i = 0;
    while (i <= 1000000000) {
      i++;
    }
    setDirection("column");
  }, [direction]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        flexDirection: direction,
        flexWrap: "wrap",
        width: 600,
      }}
    >
      {Array.from({ length: 30 }).map((item, index) => {
        const color = "#" + Math.random().toString(16).slice(2, 8);
        return (
          <div
            key={index}
            style={{
              width: 100,
              height: 100,
              margin: 10,
              backgroundColor: color,
            }}
          >
            {index}
          </div>
        );
      })}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

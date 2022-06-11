/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-11 20:23:06
 */
const { useState } = React;
useState();
const App = () => {
  const num = 0;
  return (
    <div
      className="red"
      style={{ fontSize: 14 }}
      onClick={() => {
        console.log("mouseDown div");
      }}
    >
      <span>hello</span>
      <h1>{num}</h1>
      <span>react</span>
      <p
        onClick={(e) => {
          e.stopPropagation();
          console.log("mouseDown p");
        }}
      >
        <button
          onClick={(e) => {
            console.log("mouseDown button");
          }}
        >
          计数
        </button>
      </p>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

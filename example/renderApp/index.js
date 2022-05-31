/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 16:43:21
 */
/*
 * @Author: Zhouqi
 * @Date: 2022-05-17 20:09:43
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 16:20:59
 */
const App = () => {
  const num = 0;
  return (
    <div className="red" style={{ fontSize: 14 }}>
      <span>hello</span>
      <h1>{num}</h1>
      <span>react</span>
      <br />
      <button
        onClick={() => {
          console.log("click");
        }}
      >
        计数
      </button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
/*
 * @Author: Zhouqi
 * @Date: 2022-05-17 20:09:43
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-31 15:31:15
 */
const App = () => {
  return (
    <div className="red">
      <span>hello</span>
      <p></p>
      <span>react</span>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

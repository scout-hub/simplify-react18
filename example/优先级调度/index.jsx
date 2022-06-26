/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-26 20:52:22
 */
const { useState, useEffect } = React;

const App = () => {
  const [num, setNum] = useState(0);
  useEffect(() => {
    const btn = document.getElementById("btn1");
    setTimeout(() => {
      setNum((num) => num + 1);
    }, 1000);
    setTimeout(() => {
      btn.click();
    }, 1010);
  }, []);
  return (
    <div className="red">
      <input type="text" />
      <button
        id="btn1"
        onClick={() => {
          setNum((num) => num + 2);
        }}
      ></button>
      <button onClick={() => {}}>更新</button>
      {Array.from(new Array(100000)).map((item, i) => (
        <h1 key={i}>{num}</h1>
      ))}
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

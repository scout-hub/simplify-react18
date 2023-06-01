/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-04-16 15:07:49
 */
const { useState, useEffect } = React;

const App = () => {
  const [num, setNum] = useState(0);
  useEffect(() => {
    const btn = document.getElementById("btn1");
    setTimeout(() => {
      setNum((num) => num + 2);
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
          setNum((num) => num + 1);
        }}
      ></button>
      {Array.from(new Array(1)).map((item, i) => (
        <h1 key={i}>
          <span>{num}</span>
        </h1>
      ))}
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

/*
 * @Author: Zhouqi
 * @Date: 2022-05-17 20:09:43
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-01 15:23:26
 */
const { useState } = React;
const App = () => {
  const [num, setNum] = useState(0);
  return (
    <div>
      <h1 onMouseDown={()=>{
        console.log(1);
      }}>{num}</h1>
      <button>计数</button>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

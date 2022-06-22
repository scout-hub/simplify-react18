/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-22 16:03:30
 */
const { useState, useEffect } = React;

// const App = () => {
//   const [num, setNum] = useState(0);
//   const btnRef = useRef(null);

//   const click = () => setNum((num) => num + 2);

//   useEffect(() => {
//     setTimeout(() => {
//       setNum(1);
//     }, 1000);
//     setTimeout(() => {
//       btnRef.current.click()
//     }, 1000);
//   }, []);

//   return (
//     <div className="red">
//       {Array.from(new Array(6000)).map(() => (
//         <h1>{num}</h1>
//       ))}
//       <button
//         ref={btnRef}
//         onClick={(e) => {
//           click();
//         }}
//       >
//         计数
//       </button>
//     </div>
//   );
// };
const App = () => {
  const [num, setNum] = useState(0);
  return (
    <div className="red">
      <input type="text" />
      <button
        id="btn1"
        onClick={() => {
          setNum((num) => num + 2);
        }}
      ></button>
      <button
        onClick={() => {
          const btn = document.getElementById("btn1");
          setTimeout(() => {
            setNum((num) => num + 1);
          }, 1000);
          setTimeout(() => {
            btn.click();
          }, 1060);
        }}
      >
        更新
      </button>
      {Array.from(new Array(100000)).map((item, i) => (
        <h1 key={i}>{num}</h1>
      ))}
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

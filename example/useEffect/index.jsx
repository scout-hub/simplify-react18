/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-06-15 22:16:00
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
    // console.log("parent");
    // const timer = setInterval(() => {
    //   console.log("timer");
    // }, 1000);
    // return () => {
    //   clearInterval(timer);
    // };
  }, [num]);

  useEffect(() => {
    // console.log("parent");
    // const timer = setInterval(() => {
    //   console.log("timer");
    // }, 1000);
    // return () => {
    //   clearInterval(timer);
    // };
  }, [num]);

  return (
    <div className="red">
      {num}
      <Child />
      <button
        onClick={(e) => {
          setNum(num + 1);
        }}
      >
        计数
      </button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// const { useState, useEffect } = React;

// const DEFAULT_MESSAGE = "loading ...";

// const MyComponent = ({
//   level,
//   color
// }) => {
//   const [message, setMessage] = React.useState(DEFAULT_MESSAGE);
//   React.useEffect(() => {
//     const newMessage = `Level ${level}`;
//     console.log(newMessage, color);
//     setMessage(newMessage);
//   }, []);

//   return (
//     <div style={{ border: `4px solid ${color}` }}>
//       {message}
//       {message !== DEFAULT_MESSAGE && level > 0 && (
//         <MyComponent level={level - 1} color={color} />
//       )}
//     </div>
//   );
// };

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<MyComponent level={1} color="red" />);

// const root1 = ReactDOM.createRoot(document.getElementById("root1"));
// root1.render(<MyComponent level={1} color="green" />,);



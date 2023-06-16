/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-06-01 09:55:10
 */
const { useState, useEffect, useLayoutEffect } = React;

const DEFAULT_MESSAGE = "loading ...";

const MyComponent = ({
  level,
  color
}) => {
  const [message, setMessage] = React.useState(DEFAULT_MESSAGE);
  React.useEffect(() => {
    const newMessage = `Level ${level}`;
    console.log(newMessage, color);
    setMessage(newMessage);
  }, []);

  return (
    <div style={{ border: `4px solid ${color}` }}>
      {message}
      {message !== DEFAULT_MESSAGE && level > 0 && (
        <MyComponent level={level - 1} color={color} />
      )}
    </div>
  );
};

ReactDOM.render(
  <MyComponent level={1} color="green" />,
  document.querySelector("#root1")
);
ReactDOM.render(
  <MyComponent level={1} color="red" />,
  document.querySelector("#root2")
);
// ReactDOM.render(
//   <MyComponent level={10} color="yellow" />,
//   document.querySelector("#root3")
// );



// App useEffect Fiber passiveEffect
// 下一贞执行useEffect回调

// setDirection DiscreteEventPriority 1
// 当前这真又重新执行了更新 到了commitRoot

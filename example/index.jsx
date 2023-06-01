/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-05-31 22:14:31
 */
const { useState, useEffect, useLayoutEffect } = React;

function useTest(name) {
  const [state, setState] = React.useState(0);
  React.useEffect(() => {
    console.log(1);
    setState(1);
  });
  return state;
}

function Root1() {
  const state = useTest('Root1');
  return (
    <div>
      {'' + state}
      {state && <Child1 />}
    </div>
  );
}
function Child1() {
  const state = useTest('Child1');
  return (
    <div>
      {'' + state}
      {state && <Child2 />}
    </div>
  );
}
function Child2() {
  const state = useTest('Child2');
  return <div>{'' + state}</div>;
}

function Root2() {
  React.useEffect(() => {
    console.log(2);
  }, []);
  return null;
}

const App = () => {
  const [direction, setDirection] = useState("vertical");

  // 视图会有一个变化的过程（闪烁）
  useEffect(() => {
    // let i = 0;
    // while (i <= 1000000000) {
    //   i++;
    // }
    // setDirection("column");
    // return () => {
    //   console.log("unmount useEffect");
    // };
    // if(direction === 'column') {
    //   setDirection('vertical');
    // }
    console.log(direction);
  }, [direction]);

  // 直接呈现执行useLayoutEffect后的视图
  useLayoutEffect(() => {
    // let i = 0;
    // while(i <= 1000000000) {
    //   i++;
    // }
    setDirection("column");
    // return () => {
    //   console.log("unmount useLayoutEffect");
    // };
  }, [direction]);

  return (
    <div
    // style={{
    //   display: "flex",
    //   justifyContent: "space-around",
    //   flexDirection: direction,
    //   flexWrap: "wrap",
    //   width: 600,
    // }}
    >
      {/* {Array.from({ length: 30 }).map((item, index) => {
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
      })} */}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root1 />);
root.render(<Root2 />);

// App useEffect Fiber passiveEffect
// 下一贞执行useEffect回调

// setDirection DiscreteEventPriority 1
// 当前这真又重新执行了更新 到了commitRoot

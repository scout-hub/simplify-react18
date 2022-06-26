/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-26 21:39:35
 */
const { useReducer } = React;

const initState = { count: 0 };

const reducer = (state, action) => {
  switch (action.type) {
    case "add":
      return { count: ++state.count };
    case "del":
      return { count: --state.count };
    default:
      break;
  }
};

const Child = (props) => {
  const { child } = props;
  return <div>{child}</div>;
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initState);
  return (
    <div>
      <button
        onClick={() => {
          dispatch({ type: "add" });
        }}
      >
        增加
      </button>
      <button
        onClick={() => {
          dispatch({ type: "del" });
        }}
      >
        减少
      </button>
      <Child child={state.count} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

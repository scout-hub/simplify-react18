/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-27 16:24:31
 */
const { useReducer } = React;

function initChildCount(initialCount) {
  return { count: initialCount };
}

const childReducer = (state, action) => {
  switch (action.type) {
    case "add":
      return { count: ++state.count };
    case "del":
      return { count: --state.count };
    case "reset":
      return initChildCount(action.payload);
    default:
      break;
  }
};

const Child = ({ childCount }) => {
  const [state, dispatch] = useReducer(
    childReducer,
    childCount,
    initChildCount
  );
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
      <button
        onClick={() => {
          dispatch({ type: "reset", payload: 10 });
        }}
      >
        重置
      </button>
      child：{state.count}
    </div>
  );
};

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
      parent：{state.count}
      <Child childCount={state.count} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

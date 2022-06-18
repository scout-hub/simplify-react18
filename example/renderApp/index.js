/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-18 21:50:02
 */
const { useState, Component } = React;
class Demo extends Component {
  constructor() {
    super();
  }

  render() {
    return <div>123</div>;
  }
}

const App = () => {
  const [num, setNum] = useState(1);

  return (
    <div className="red">
      {null}
      <h1>{num}</h1>
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

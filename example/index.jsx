/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-29 11:26:21
 */
const { Component, useState } = React;

class Child extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    console.log(nextProps, prevState);
    return {};
  }

  render() {
    const { num } = this.props;
    return <div>{num}</div>;
  }
}

const App = () => {
  const [num, setNum] = useState(0);

  return (
    <div>
      <Child num={num} />
      <button
        onClick={() => {
          setNum(num + 1);
        }}
      >
        更新
      </button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

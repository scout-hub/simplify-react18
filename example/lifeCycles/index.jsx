/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-04-13 21:09:22
 */
const { Component, useState } = React;

class Child extends Component {
  constructor(props) {
    console.log("constructor");
    super(props);
    this.state = {
      num: 0,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    console.log("getDerivedStateFromProps");
    return nextProps;
  }

  // 不安全的生命周期
  componentWillMount() {
    console.log("componentWillMount");
  }

  // 不安全的生命周期
  componentWillReceiveProps(newProps) {
    console.log("componentWillReceiveProps", newProps);
  }

  shouldComponentUpdate(newProps, newState) {
    console.log("shouldComponentUpdate", newProps, newState);
    return true;
  }

  componentDidMount() {
    console.log("componentDidMount");
  }

  // 不安全的生命周期
  componentWillUpdate(newProps, newState) {
    console.log("componentWillUpdate", newProps, newState);
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log("getSnapshotBeforeUpdate", prevProps, prevState);
    return {};
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("componentDidUpdate", prevProps, prevState, snapshot);
  }

  render() {
    console.log("render");
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

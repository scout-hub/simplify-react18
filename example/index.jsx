/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-30 15:16:02
 */
const { Component, useState } = React;

class Child extends Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 0,
    };
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   console.log("getDerivedStateFromProps");
  //   return nextProps;
  // }

  componentWillMount() {
    // 这里同步调用setState不会触发额外的渲染更新
    this.setState({ num: 14 }, () => {
      console.log('setState callback');
    });
  }

  // componentWillReceiveProps(newProps) {
  //   console.log("componentWillReceiveProps", newProps);
  // }

  // shouldComponentUpdate(newProps, newState) {
  //   console.log("shouldComponentUpdate", newProps, newState);
  //   return true;
  // }

  // componentDidMount() {
  //   console.log("componentDidMount");
  // }

  // componentWillUpdate(newProps, newState) {
  //   console.log("componentWillUpdate", newProps, newState);
  // }

  // getSnapshotBeforeUpdate(prevProps, prevState) {
  //   console.log("getSnapshotBeforeUpdate", prevProps, prevState);
  //   return {};
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   console.log("componentDidUpdate", prevProps, prevState, snapshot);
  // }

  render() {
    console.log("render");
    const { num } = this.state;
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

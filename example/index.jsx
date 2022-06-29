/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-29 17:42:04
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

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   console.log("getDerivedStateFromProps");
  //   return nextProps;
  // }

  componentWillMount() {
    console.log("componentWillMount");
  }

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

  componentWillUpdate(newProps, newState) {
    console.log("componentWillUpdate", newProps, newState);
  }

  componentDidUpdate() {
    console.log("componentDidUpdate");
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

/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-30 16:48:56
 */
const { Component, useState } = React;

class Child extends Component {
  constructor(props) {
    super(props);
    this.state = {
      age: 12,
      num: 0,
    };
  }

  update = () => {
    // 只执行一次更新(批量处理)，因为优先级相同，后续的更新直接return了（ensureRootIsScheduled）
    // this.setState({
    //   num: this.state.num + 1,
    // });
    // this.setState({
    //   num: this.state.num + 1,
    // });
    // this.setState({
    //   num: this.state.num + 1,
    // });

    // 后一个setState的值依赖前一个
    this.setState((state, props) => {
      return { num: state.num + 1 };
    });
    this.setState((state, props) => {
      console.log(state.num);
      return { num: state.num + 1 };
    });
  };

  render() {
    console.log("render");
    const { num } = this.state;
    return (
      <div>
        {num}
        <button onClick={this.update}>更新child</button>
      </div>
    );
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

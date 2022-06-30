/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-30 22:30:11
 */
const { PureComponent, Component, useState } = React;

class Child extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      num: 0,
    };
  }

  update = () => {
    this.setState((state) => {
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
      <Child />
      <button
        onClick={() => {
          setNum(num + 1);
          // setNum(num + 1);
        }}
      >
        更新
      </button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-01 22:00:46
 */
const { Fragment, Component, useState } = React;

const Child = (props) => {
  const { child } = props;
  return <p>{child}</p>;
};

class Child1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Child1",
    };
  }

  render() {
    const { title } = this.state;
    return (
      <Fragment key={title}>
        <div>{title}</div>
        <div>Fragement</div>
      </Fragment>
    );
  }
}

const App = () => {
  const title = "hello";
  const child = "child";
  const [num, setNum] = useState(0);
  return (
    <div className="red">
      {title}
      <div>react</div>
      {["study", "react"].map((item) => (
        <span key={item}>{item}&nbsp;</span>
      ))}
      {num}
      <button onClick={() => setNum(num + 1)}>更新</button>
      <Child child={child} />
      <Child1 />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

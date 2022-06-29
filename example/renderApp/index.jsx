/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-29 21:43:32
 */
const Child = (props) => {
  const { child } = props;
  return <p>{child}</p>;
};

class Child1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Child1",
    };
  }

  render() {
    const { title } = this.state;
    return <div>{title}</div>;
  }
}

const App = () => {
  const title = "hello";
  const child = "child";
  return (
    <div className="red">
      {title}
      <div>react</div>
      {["study", "react"].map((item) => (
        <span>{item}&nbsp;</span>
      ))}
      <Child child={child} />
      <Child1 />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

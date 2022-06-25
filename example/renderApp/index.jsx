/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-25 21:33:16
 */
const Child = (props) => {
  const { child } = props;
  return <p>{child}</p>;
};

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
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

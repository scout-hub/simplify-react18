/*
 * @Author: Zhouqi
 * @Date: 2022-05-31 16:21:54
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-06 21:15:22
 */
const { useState, useEffect } = React;

const Child = (props) => {
  const { child } = props;
  return <p>{child}</p>;
};

const App = () => {
  const [flag, setFlag] = useState(true);

  return <div>123</div>;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

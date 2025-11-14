import { Typography } from "antd";

const { Title } = Typography;

const DefaultPage = () => {
  return (
    <div>
      <Title level={2}>Default</Title>
      <p>这是默认页面的内容区域</p>
    </div>
  );
};

export default DefaultPage;


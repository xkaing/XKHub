import { Typography, Tabs } from "antd";
import W40KIcons from "../components/W40KIcons";

const { Title } = Typography;

const W40KPage = () => {
  const tabItems = [
    {
      key: "space-marines",
      label: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <W40KIcons type="space-marines" />
          <span>星际战士</span>
        </div>
      ),
      children: (
        <div>
          <p>星际战士内容</p>
        </div>
      ),
    },
    {
      key: "imperial-forces",
      label: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <W40KIcons type="imperial-forces" />
          <span>帝国之军</span>
        </div>
      ),
      children: (
        <div>
          <p>帝国之军内容</p>
        </div>
      ),
    },
    {
      key: "chaos-forces",
      label: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <W40KIcons type="chaos-forces" />
          <span>混沌势力</span>
        </div>
      ),
      children: (
        <div>
          <p>混沌势力内容</p>
        </div>
      ),
    },
    {
      key: "xenos-threats",
      label: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <W40KIcons type="xenos-threats" />
          <span>异形威胁</span>
        </div>
      ),
      children: (
        <div>
          <p>异形威胁内容</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>W40K</Title>
      <Tabs defaultActiveKey="space-marines" items={tabItems} />
    </div>
  );
};

export default W40KPage;

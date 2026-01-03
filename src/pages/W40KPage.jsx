import { Typography, Tabs } from "antd";
import W40KIcons from "../components/W40KIcons";
import W40KIconsImage from "../components/W40KIconsImage";

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
        <Tabs
          tabPosition="left"
          defaultActiveKey="sisters"
          items={[
            {
              key: "sisters",
              label: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <W40KIconsImage type="sisters" />
                  <span>修女会</span>
                </div>
              ),
              children: (
                <div>
                  <p>修女会内容</p>
                </div>
              ),
            },
            {
              key: "custodes",
              label: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <W40KIconsImage type="custodes" />
                  <span>帝国禁军</span>
                </div>
              ),
              children: (
                <div>
                  <p>帝国禁军内容</p>
                </div>
              ),
            },
            {
              key: "mechanicus",
              label: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <W40KIconsImage type="mechanicus" />
                  <span>机械修会</span>
                </div>
              ),
              children: (
                <div>
                  <p>机械修会内容</p>
                </div>
              ),
            },
            {
              key: "imperial-guard",
              label: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <W40KIconsImage type="imperial-guard" />
                  <span>帝国卫队</span>
                </div>
              ),
              children: (
                <div>
                  <p>帝国卫队内容</p>
                </div>
              ),
            },
          ]}
        />
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

import { Typography, Tabs } from "antd";
import W40KIcons from "../components/W40KIcons";
import W40KTabLabel from "../components/W40KTabLabel";

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
        <Tabs
          tabPosition="left"
          defaultActiveKey="space-marines"
          items={[
            {
              key: "space-marines",
              label: <W40KTabLabel type="space-marines" />,
              children: (
                <div>
                  <p>星际战士内容</p>
                </div>
              ),
            },
            {
              key: "black-templars",
              label: <W40KTabLabel type="black-templars" />,
              children: (
                <div>
                  <p>黑色圣堂内容</p>
                </div>
              ),
            },
            {
              key: "blood-angels",
              label: <W40KTabLabel type="blood-angels" />,
              children: (
                <div>
                  <p>圣血天使内容</p>
                </div>
              ),
            },
            {
              key: "dark-angels",
              label: <W40KTabLabel type="dark-angels" />,
              children: (
                <div>
                  <p>暗黑天使内容</p>
                </div>
              ),
            },
            {
              key: "deathwatch",
              label: <W40KTabLabel type="deathwatch" />,
              children: (
                <div>
                  <p>死亡守望内容</p>
                </div>
              ),
            },
            {
              key: "grey-knights",
              label: <W40KTabLabel type="grey-knights" />,
              children: (
                <div>
                  <p>灰骑士内容</p>
                </div>
              ),
            },
            {
              key: "space-wolves",
              label: <W40KTabLabel type="space-wolves" />,
              children: (
                <div>
                  <p>太空野狼内容</p>
                </div>
              ),
            },
          ]}
        />
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
              label: <W40KTabLabel type="sisters" />,
              children: (
                <div>
                  <p>修女会内容</p>
                </div>
              ),
            },
            {
              key: "custodes",
              label: <W40KTabLabel type="custodes" />,
              children: (
                <div>
                  <p>帝国禁军内容</p>
                </div>
              ),
            },
            {
              key: "mechanicus",
              label: <W40KTabLabel type="mechanicus" />,
              children: (
                <div>
                  <p>机械修会内容</p>
                </div>
              ),
            },
            {
              key: "imperial-guard",
              label: <W40KTabLabel type="imperial-guard" />,
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
        <Tabs
          tabPosition="left"
          defaultActiveKey="chaos-space-marines"
          items={[
            {
              key: "chaos-space-marines",
              label: <W40KTabLabel type="chaos-space-marines" />,
              children: (
                <div>
                  <p>混沌星际战士内容</p>
                </div>
              ),
            },
            {
              key: "death-guard",
              label: <W40KTabLabel type="death-guard" />,
              children: (
                <div>
                  <p>死亡守卫内容</p>
                </div>
              ),
            },
            {
              key: "thousand-sons",
              label: <W40KTabLabel type="thousand-sons" />,
              children: (
                <div>
                  <p>千子内容</p>
                </div>
              ),
            },
            {
              key: "world-eaters",
              label: <W40KTabLabel type="world-eaters" />,
              children: (
                <div>
                  <p>吞世者内容</p>
                </div>
              ),
            },
            {
              key: "chaos-demons",
              label: <W40KTabLabel type="chaos-demons" />,
              children: (
                <div>
                  <p>混沌恶魔内容</p>
                </div>
              ),
            },
          ]}
        />
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
        <Tabs
          tabPosition="left"
          defaultActiveKey="aeldari"
          items={[
            {
              key: "aeldari",
              label: <W40KTabLabel type="aeldari" />,
              children: (
                <div>
                  <p>艾达灵族内容</p>
                </div>
              ),
            },
            {
              key: "dark-eldar",
              label: <W40KTabLabel type="dark-eldar" />,
              children: (
                <div>
                  <p>黑暗灵族内容</p>
                </div>
              ),
            },
            {
              key: "tyranids",
              label: <W40KTabLabel type="tyranids" />,
              children: (
                <div>
                  <p>泰伦虫族内容</p>
                </div>
              ),
            },
            {
              key: "genestealer-cults",
              label: <W40KTabLabel type="genestealer-cults" />,
              children: (
                <div>
                  <p>基因窃取者教派内容</p>
                </div>
              ),
            },
            {
              key: "votann",
              label: <W40KTabLabel type="votann" />,
              children: (
                <div>
                  <p>沃坦联盟内容</p>
                </div>
              ),
            },
            {
              key: "necrons",
              label: <W40KTabLabel type="necrons" />,
              children: (
                <div>
                  <p>太空死灵内容</p>
                </div>
              ),
            },
            {
              key: "orks",
              label: <W40KTabLabel type="orks" />,
              children: (
                <div>
                  <p>欧克蛮人内容</p>
                </div>
              ),
            },
            {
              key: "tau",
              label: <W40KTabLabel type="tau" />,
              children: (
                <div>
                  <p>钛帝国内容</p>
                </div>
              ),
            },
          ]}
        />
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

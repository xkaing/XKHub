// 图片路径映射 - 所有图片已移至 public/assets/W40K/
const iconPaths = {
  sisters: "/assets/W40K/修女会.png",
  custodes: "/assets/W40K/帝皇禁军.png",
  mechanicus: "/assets/W40K/机械修会.png",
  imperialGuard: "/assets/W40K/帝国卫队.png",
  chaosSpaceMarines: "/assets/W40K/混沌星际战士.png",
  deathGuard: "/assets/W40K/死亡守卫.png",
  thousandSons: "/assets/W40K/千子.png",
  worldEaters: "/assets/W40K/吞世者.png",
  chaosDemons: "/assets/W40K/混沌恶魔.png",
  spaceMarines: "/assets/W40K/星际战士.png",
  blackTemplars: "/assets/W40K/黑色圣堂.png",
  bloodAngels: "/assets/W40K/圣血天使.png",
  darkAngels: "/assets/W40K/暗黑天使.png",
  deathwatch: "/assets/W40K/死亡守望.png",
  greyKnights: "/assets/W40K/灰骑士.png",
  spaceWolves: "/assets/W40K/太空野狼.png",
  aeldari: "/assets/W40K/艾达灵族.png",
  darkEldar: "/assets/W40K/黑暗灵族.png",
  tyranids: "/assets/W40K/泰伦虫族.png",
  genestealerCults: "/assets/W40K/基金窃取者教派.png",
  votann: "/assets/W40K/沃坦联盟.png",
  necrons: "/assets/W40K/太空死灵.png",
  orks: "/assets/W40K/欧克蛮人.png",
  tau: "/assets/W40K/钛帝国.png",
};

const W40KTabLabel = ({ type }) => {
  const getIconAndLabel = (iconType) => {
    switch (iconType) {
      case "sisters":
      case "修女会":
        return {
          icon: iconPaths.sisters,
          label: "修女会",
        };
      case "custodes":
      case "帝国禁军":
        return {
          icon: iconPaths.custodes,
          label: "帝国禁军",
        };
      case "mechanicus":
      case "机械修会":
        return {
          icon: iconPaths.mechanicus,
          label: "机械修会",
        };
      case "imperial-guard":
      case "帝国卫队":
        return {
          icon: iconPaths.imperialGuard,
          label: "帝国卫队",
        };
      case "chaos-space-marines":
      case "混沌星际战士":
        return {
          icon: iconPaths.chaosSpaceMarines,
          label: "混沌星际战士",
        };
      case "death-guard":
      case "死亡守卫":
        return {
          icon: iconPaths.deathGuard,
          label: "死亡守卫",
        };
      case "thousand-sons":
      case "千子":
        return {
          icon: iconPaths.thousandSons,
          label: "千子",
        };
      case "world-eaters":
      case "吞世者":
        return {
          icon: iconPaths.worldEaters,
          label: "吞世者",
        };
      case "chaos-demons":
      case "混沌恶魔":
        return {
          icon: iconPaths.chaosDemons,
          label: "混沌恶魔",
        };
      case "space-marines":
      case "星际战士":
        return {
          icon: iconPaths.spaceMarines,
          label: "星际战士",
        };
      case "black-templars":
      case "黑色圣堂":
        return {
          icon: iconPaths.blackTemplars,
          label: "黑色圣堂",
        };
      case "blood-angels":
      case "圣血天使":
        return {
          icon: iconPaths.bloodAngels,
          label: "圣血天使",
        };
      case "dark-angels":
      case "暗黑天使":
      case "黑暗天使":
        return {
          icon: iconPaths.darkAngels,
          label: "暗黑天使",
        };
      case "deathwatch":
      case "死亡守望":
        return {
          icon: iconPaths.deathwatch,
          label: "死亡守望",
        };
      case "grey-knights":
      case "灰骑士":
        return {
          icon: iconPaths.greyKnights,
          label: "灰骑士",
        };
      case "space-wolves":
      case "太空野狼":
        return {
          icon: iconPaths.spaceWolves,
          label: "太空野狼",
        };
      case "aeldari":
      case "艾达灵族":
        return {
          icon: iconPaths.aeldari,
          label: "艾达灵族",
        };
      case "dark-eldar":
      case "黑暗灵族":
        return {
          icon: iconPaths.darkEldar,
          label: "黑暗灵族",
        };
      case "tyranids":
      case "泰伦虫族":
        return {
          icon: iconPaths.tyranids,
          label: "泰伦虫族",
        };
      case "genestealer-cults":
      case "基因窃取者教派":
      case "基金窃取者教派":
        return {
          icon: iconPaths.genestealerCults,
          label: "基因窃取者教派",
        };
      case "votann":
      case "沃坦联盟":
        return {
          icon: iconPaths.votann,
          label: "沃坦联盟",
        };
      case "necrons":
      case "太空死灵":
        return {
          icon: iconPaths.necrons,
          label: "太空死灵",
        };
      case "orks":
      case "欧克蛮人":
        return {
          icon: iconPaths.orks,
          label: "欧克蛮人",
        };
      case "tau":
      case "钛帝国":
        return {
          icon: iconPaths.tau,
          label: "钛帝国",
        };
      default:
        return null;
    }
  };

  const data = getIconAndLabel(type);

  if (!data) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <img src={data.icon} alt={data.label} style={{ width: "48px", height: "48px", objectFit: "contain" }} />
      <span>{data.label}</span>
    </div>
  );
};

export default W40KTabLabel;


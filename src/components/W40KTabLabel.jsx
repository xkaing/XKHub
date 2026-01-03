import sistersIcon from "../assets/W40K/修女会.png";
import custodesIcon from "../assets/W40K/帝皇禁军.png";
import mechanicusIcon from "../assets/W40K/机械修会.png";
import imperialGuardIcon from "../assets/W40K/帝国卫队.png";
import chaosSpaceMarinesIcon from "../assets/W40K/混沌星际战士.png";
import deathGuardIcon from "../assets/W40K/死亡守卫.png";
import thousandSonsIcon from "../assets/W40K/千子.png";
import worldEatersIcon from "../assets/W40K/吞世者.png";
import chaosDemonsIcon from "../assets/W40K/混沌恶魔.png";
import spaceMarinesIcon from "../assets/W40K/星际战士.png";
import blackTemplarsIcon from "../assets/W40K/黑色圣堂.png";
import bloodAngelsIcon from "../assets/W40K/圣血天使.png";
import darkAngelsIcon from "../assets/W40K/暗黑天使.png";
import deathwatchIcon from "../assets/W40K/死亡守望.png";
import greyKnightsIcon from "../assets/W40K/灰骑士.png";
import spaceWolvesIcon from "../assets/W40K/太空野狼.png";
import aeldariIcon from "../assets/W40K/艾达灵族.png";
import darkEldarIcon from "../assets/W40K/黑暗灵族.png";
import tyranidsIcon from "../assets/W40K/泰伦虫族.png";
import genestealerCultsIcon from "../assets/W40K/基金窃取者教派.png";
import votannIcon from "../assets/W40K/沃坦联盟.png";
import necronsIcon from "../assets/W40K/太空死灵.png";
import orksIcon from "../assets/W40K/欧克蛮人.png";
import tauIcon from "../assets/W40K/钛帝国.png";

const W40KTabLabel = ({ type }) => {
  const getIconAndLabel = (iconType) => {
    switch (iconType) {
      case "sisters":
      case "修女会":
        return {
          icon: sistersIcon,
          label: "修女会",
        };
      case "custodes":
      case "帝国禁军":
        return {
          icon: custodesIcon,
          label: "帝国禁军",
        };
      case "mechanicus":
      case "机械修会":
        return {
          icon: mechanicusIcon,
          label: "机械修会",
        };
      case "imperial-guard":
      case "帝国卫队":
        return {
          icon: imperialGuardIcon,
          label: "帝国卫队",
        };
      case "chaos-space-marines":
      case "混沌星际战士":
        return {
          icon: chaosSpaceMarinesIcon,
          label: "混沌星际战士",
        };
      case "death-guard":
      case "死亡守卫":
        return {
          icon: deathGuardIcon,
          label: "死亡守卫",
        };
      case "thousand-sons":
      case "千子":
        return {
          icon: thousandSonsIcon,
          label: "千子",
        };
      case "world-eaters":
      case "吞世者":
        return {
          icon: worldEatersIcon,
          label: "吞世者",
        };
      case "chaos-demons":
      case "混沌恶魔":
        return {
          icon: chaosDemonsIcon,
          label: "混沌恶魔",
        };
      case "space-marines":
      case "星际战士":
        return {
          icon: spaceMarinesIcon,
          label: "星际战士",
        };
      case "black-templars":
      case "黑色圣堂":
        return {
          icon: blackTemplarsIcon,
          label: "黑色圣堂",
        };
      case "blood-angels":
      case "圣血天使":
        return {
          icon: bloodAngelsIcon,
          label: "圣血天使",
        };
      case "dark-angels":
      case "暗黑天使":
      case "黑暗天使":
        return {
          icon: darkAngelsIcon,
          label: "暗黑天使",
        };
      case "deathwatch":
      case "死亡守望":
        return {
          icon: deathwatchIcon,
          label: "死亡守望",
        };
      case "grey-knights":
      case "灰骑士":
        return {
          icon: greyKnightsIcon,
          label: "灰骑士",
        };
      case "space-wolves":
      case "太空野狼":
        return {
          icon: spaceWolvesIcon,
          label: "太空野狼",
        };
      case "aeldari":
      case "艾达灵族":
        return {
          icon: aeldariIcon,
          label: "艾达灵族",
        };
      case "dark-eldar":
      case "黑暗灵族":
        return {
          icon: darkEldarIcon,
          label: "黑暗灵族",
        };
      case "tyranids":
      case "泰伦虫族":
        return {
          icon: tyranidsIcon,
          label: "泰伦虫族",
        };
      case "genestealer-cults":
      case "基因窃取者教派":
      case "基金窃取者教派":
        return {
          icon: genestealerCultsIcon,
          label: "基因窃取者教派",
        };
      case "votann":
      case "沃坦联盟":
        return {
          icon: votannIcon,
          label: "沃坦联盟",
        };
      case "necrons":
      case "太空死灵":
        return {
          icon: necronsIcon,
          label: "太空死灵",
        };
      case "orks":
      case "欧克蛮人":
        return {
          icon: orksIcon,
          label: "欧克蛮人",
        };
      case "tau":
      case "钛帝国":
        return {
          icon: tauIcon,
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


import { Typography, Card, Row, Col, Tag } from "antd";

const { Title } = Typography;

// 罗马数字转中文数字
const romanToChinese = (roman) => {
  const map = {
    "I": "一", "II": "二", "III": "三", "IV": "四", "V": "五",
    "VI": "六", "VII": "七", "VIII": "八", "IX": "九", "X": "十",
    "XI": "十一", "XII": "十二", "XIII": "十三", "XIV": "十四", "XV": "十五",
    "XVI": "十六", "XVII": "十七", "XVIII": "十八", "XIX": "十九", "XX": "二十"
  }
  return map[roman] || roman;
};

// 20个军团数据（英文+中文）
const legions = [
  { 
    number: "I", 
    name: "Dark Angels", 
    nameCN: "暗黑天使", 
    primarch: "Lion El'Jonson", 
    primarchCN: "莱恩·庄森",
    heroes: [
      { name: "Luther", nameCN: "路瑟", tags: [] },
      { name: "Corswain", nameCN: "科斯温", tags: [] },
      { name: "Zahariel", nameCN: "扎哈里尔", tags: [] },
      { name: "", nameCN: "阿斯特兰", tags: ["第一连长","堕天使"] }
    ]
  },
  { 
    number: "II", 
    name: "[REDACTED]", 
    nameCN: "已抹除", 
    primarch: "[REDACTED]", 
    primarchCN: "已抹除",
    heroes: []
  },
  { 
    number: "III", 
    name: "Emperor's Children", 
    nameCN: "帝皇之子", 
    primarch: "Fulgrim", 
    primarchCN: "福格瑞姆",
    heroes: [
      { name: "Eidolon", nameCN: "艾多隆", tags: ["第一连长"] },
      { name: "Lucius", nameCN: "卢修斯", tags: [] },
      { name: "", nameCN: "法比乌斯·拜尔", tags: ["首席药剂师"] },
      { name: "", nameCN: "索尔·塔维兹", tags: ["第三连长"] }
    ]
  },
  { 
    number: "IV", 
    name: "Iron Warriors", 
    nameCN: "钢铁勇士", 
    primarch: "Perturabo", 
    primarchCN: "佩图拉博",
    heroes: [
      { name: "Warsmith Dantioch", nameCN: "战争铁匠丹提奥克", tags: [] },
      { name: "Forrix", nameCN: "福瑞克斯", tags: ["第一连长"] },
      { name: "Kroeger", nameCN: "克罗格", tags: [] }
    ]
  },
  { 
    number: "V", 
    name: "White Scars", 
    nameCN: "白色伤疤", 
    primarch: "Jaghatai Khan", 
    primarchCN: "察合台可汗",
    heroes: [
      { name: "Yesugei", nameCN: "耶苏盖", tags: [] },
      { name: "Qin Xa", nameCN: "秦夏", tags: ["怯薛之主"] },
      { name: "Torghun Khan", nameCN: "托尔贡可汗", tags: [] },
      { name: "", nameCN: "朱巴汗", tags: ["第一连长","狩猎大师"] }
    ]
  },
  { 
    number: "VI", 
    name: "Space Wolves", 
    nameCN: "太空野狼", 
    primarch: "Leman Russ", 
    primarchCN: "黎曼·鲁斯",
    heroes: [
      { name: "Bjorn the Fell-Handed", nameCN: "断手比约恩", tags: [] },
      { name: "Gunnar Gunnhilt", nameCN: "冈纳·冈希尔特", tags: [] },
      { name: "Hvarl Red-Blade", nameCN: "赫瓦尔红刃", tags: [] }
    ]
  },
  { 
    number: "VII", 
    name: "Imperial Fists", 
    nameCN: "帝国之拳", 
    primarch: "Rogal Dorn", 
    primarchCN: "罗格·多恩",
    heroes: [
      { name: "Sigismund", nameCN: "西吉斯蒙德", tags: ["第一连长", "黑色圣堂首任大元帅","原体之下第一人","第一个帝皇冠军"] },
      { name: "Alexis Polux", nameCN: "亚历克西斯·波鲁克斯", tags: [] },
      { name: "Camba Diaz", nameCN: "坎巴·迪亚兹", tags: [] }
    ]
  },
  { 
    number: "VIII", 
    name: "Night Lords", 
    nameCN: "午夜领主", 
    primarch: "Konrad Curze", 
    primarchCN: "康拉德·科兹",
    heroes: [
      { name: "Sevatar", nameCN: "塞瓦塔尔", tags: [] },
      { name: "Talonmaster", nameCN: "利爪大师", tags: [] },
      { name: "Jago Sevatarion", nameCN: "贾戈·塞瓦塔里昂", tags: [] }
    ]
  },
  { 
    number: "IX", 
    name: "Blood Angels", 
    nameCN: "圣血天使", 
    primarch: "Sanguinius", 
    primarchCN: "圣吉列斯",
    heroes: [
      { name: "Azkaellon", nameCN: "阿兹卡隆", tags: [] },
      { name: "Raldoron", nameCN: "拉多隆", tags: ["第一连长", "第一战团长"] },
      { name: "Amit", nameCN: "阿米特", tags: [] }
    ]
  },
  { 
    number: "X", 
    name: "Iron Hands", 
    nameCN: "钢铁之手", 
    primarch: "Ferrus Manus", 
    primarchCN: "费鲁斯·马努斯",
    heroes: [
      { name: "Gabriel Santar", nameCN: "加布里埃尔·桑塔尔", tags: [] },
      { name: "Autek Mor", nameCN: "奥泰克·莫尔", tags: [] },
      { name: "Shadrak Meduson", nameCN: "沙德拉克·梅杜森", tags: [] }
    ]
  },
  { 
    number: "XI", 
    name: "[REDACTED]", 
    nameCN: "已抹除", 
    primarch: "[REDACTED]", 
    primarchCN: "已抹除",
    heroes: []
  },
  { 
    number: "XII", 
    name: "World Eaters", 
    nameCN: "吞世者", 
    primarch: "Angron", 
    primarchCN: "安格隆",
    heroes: [
      { name: "Kharn", nameCN: "卡恩", tags: ["第八连长"] },
      { name: "Lhorke", nameCN: "洛尔克", tags: [] },
      { name: "Delvarus", nameCN: "德尔瓦鲁斯", tags: [] }
    ]
  },
  { 
    number: "XIII", 
    name: "Ultramarines", 
    nameCN: "极限战士", 
    primarch: "Roboute Guilliman", 
    primarchCN: "罗伯特·基里曼",
    heroes: [
      { name: "Marius Gage", nameCN: "马略斯·盖奇", tags: [] },
      { name: "Remus Ventanus", nameCN: "雷穆斯·文塔努斯", tags: [] },
      { name: "Aeonid Thiel", nameCN: "埃奥尼德·蒂尔", tags: [] }
    ]
  },
  { 
    number: "XIV", 
    name: "Death Guard", 
    nameCN: "死亡守卫", 
    primarch: "Mortarion", 
    primarchCN: "莫塔里安",
    heroes: [
      { name: "Typhon", nameCN: "提丰", tags: ["第一连长"] },
      { name: "Garro", nameCN: "加罗", tags: [] },
      { name: "Grulgor", nameCN: "格鲁戈尔", tags: [] }
    ]
  },
  { 
    number: "XV", 
    name: "Thousand Sons", 
    nameCN: "千子", 
    primarch: "Magnus the Red", 
    primarchCN: "马格努斯",
    heroes: [
      { name: "Ahzek Ahriman", nameCN: "阿兹克·阿赫里曼", tags: [] },
      { name: "Phosis T'kar", nameCN: "福西斯·特卡", tags: [] },
      { name: "Uthizzar", nameCN: "乌提扎尔", tags: [] }
    ]
  },
  { 
    number: "XVI", 
    name: "Luna Wolves", 
    nameCN: "影月苍狼", 
    primarch: "Horus Lupercal", 
    primarchCN: "荷鲁斯",
    heroes: [
      { name: "Abaddon", nameCN: "阿巴顿", tags: ["第一连长","四王议会","黑色军团", "混沌战帅"] },
      { name: "Loken", nameCN: "洛肯", tags: [] },
      { name: "Torgaddon", nameCN: "托加顿", tags: ["第二连长"] }
    ]
  },
  { 
    number: "XVII", 
    name: "Word Bearers", 
    nameCN: "怀言者", 
    primarch: "Lorgar Aurelian", 
    primarchCN: "洛迦·奥瑞利安",
    heroes: [
      { name: "Erebus", nameCN: "厄瑞波斯", tags: [] },
      { name: "Kor Phaeron", nameCN: "科尔·法厄同", tags: [] },
      { name: "Argel Tal", nameCN: "阿尔盖尔·塔尔", tags: [] }
    ]
  },
  { 
    number: "XVIII", 
    name: "Salamanders", 
    nameCN: "火蜥蜴", 
    primarch: "Vulkan", 
    primarchCN: "伏尔甘",
    heroes: [
      { name: "Artellus Numeon", nameCN: "阿特鲁斯·努米昂", tags: [] },
      { name: "Cassian Vaughn", nameCN: "卡西安·沃恩", tags: [] },
      { name: "Zytos", nameCN: "齐托斯", tags: [] }
    ]
  },
  { 
    number: "XIX", 
    name: "Raven Guard", 
    nameCN: "暗鸦守卫", 
    primarch: "Corvus Corax", 
    primarchCN: "科拉克斯",
    heroes: [
      { name: "Branne Nev", nameCN: "布兰·内夫", tags: [] },
      { name: "Agapito Nev", nameCN: "阿加皮托·内夫", tags: [] },
      { name: "Aloni", nameCN: "阿洛尼", tags: [] }
    ]
  },
  { 
    number: "XX", 
    name: "Alpha Legion", 
    nameCN: "阿尔法军团", 
    primarch: "Alpharius Omegon", 
    primarchCN: "阿尔法瑞斯 & 欧米冈",
    heroes: [
      { name: "Armillus Dynat", nameCN: "阿米卢斯·戴纳特", tags: [] },
      { name: "Ingo Pech", nameCN: "英戈·佩奇", tags: [] },
      { name: "Sheed Ranko", nameCN: "希德·兰科", tags: [] }
    ]
  },
];

const W30KPage = () => {
  return (
    <div>
      <Title level={2}>30K - Space Marine Legions</Title>
      <Row gutter={[16, 16]} className="legion-row">
        {legions.map((legion, index) => (
          <Col
            key={index}
            xs={24}
            sm={12}
            md={8}
            lg={4}
            xl={4}
            style={{
              display: "flex",
            }}
            className="legion-col"
          >
            <Card
              title={legion.name === "[REDACTED]" ? null : `第${romanToChinese(legion.number)}军团：${legion.name.toUpperCase()} ${legion.nameCN}`}
              extra={
                <span style={{ fontSize: "16px", fontWeight: "bold", opacity: 0.6 }}>
                  {legion.number}
                </span>
              }
              variant="outlined"
              hoverable
              style={{
                height: "100%",
                width: "100%",
              }}
            >
              <div>
                {legion.name === "[REDACTED]" ? (
                  <p style={{ marginBottom: 0, textAlign: "center", fontSize: "18px", fontWeight: "bold" }}>
                    [REDACTED]
                  </p>
                ) : (
                  <div>
                    <p style={{ marginBottom: 8 }}>
                      原体：{legion.primarchCN}
                    </p>
                    {legion.heroes && legion.heroes.length > 0 && (
                      <div>
                        <p style={{ marginBottom: 4, fontSize: "12px", opacity: 0.8 }}>知名人物：</p>
                        {legion.heroes.map((hero, idx) => (
                          <div key={idx} style={{ marginBottom: 8, paddingLeft: 16 }}>
                            <div style={{ marginBottom: 4, fontSize: "12px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
                              <span>{hero.name} {hero.nameCN}</span>
                              {hero.tags && hero.tags.length > 0 && (
                                <>
                                  {hero.tags.map((tag, tagIdx) => (
                                    <Tag key={tagIdx} style={{ fontSize: "11px", margin: 0 }}>
                                      {tag}
                                    </Tag>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default W30KPage;


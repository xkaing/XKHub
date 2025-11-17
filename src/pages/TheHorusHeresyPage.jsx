import { Typography, Card, Row, Col } from "antd";

const { Title } = Typography;

// 18个军团数据（英文+中文）
const legions = [
  { number: "I", name: "Dark Angels", nameCN: "暗黑天使", primarch: "Lion El'Jonson", primarchCN: "狮王·琼森", color: "#1a472a" },
  { number: "II", name: "[REDACTED]", nameCN: "已抹除", primarch: "[REDACTED]", primarchCN: "已抹除", color: "#2a2a2a" },
  { number: "III", name: "Emperor's Children", nameCN: "帝皇之子", primarch: "Fulgrim", primarchCN: "福根", color: "#6a1b9a" },
  { number: "IV", name: "Iron Warriors", nameCN: "铁战士", primarch: "Perturabo", primarchCN: "班佩尔", color: "#4a4a4a" },
  { number: "V", name: "White Scars", nameCN: "白色伤疤", primarch: "Jaghatai Khan", primarchCN: "贾盖泰·可汗", color: "#ffffff" },
  { number: "VI", name: "Space Wolves", nameCN: "太空野狼", primarch: "Leman Russ", primarchCN: "鲁斯", color: "#808080" },
  { number: "VII", name: "Imperial Fists", nameCN: "帝国之拳", primarch: "Rogal Dorn", primarchCN: "多恩", color: "#ffd700" },
  { number: "VIII", name: "Night Lords", nameCN: "夜之领主", primarch: "Konrad Curze", primarchCN: "克苏尔·克拉夫", color: "#000080" },
  { number: "IX", name: "Blood Angels", nameCN: "血天使", primarch: "Sanguinius", primarchCN: "桑圭纽斯", color: "#8b0000" },
  { number: "X", name: "Iron Hands", nameCN: "铁手", primarch: "Ferrus Manus", primarchCN: "费鲁斯·马努斯", color: "#000000" },
  { number: "XI", name: "[REDACTED]", nameCN: "已抹除", primarch: "[REDACTED]", primarchCN: "已抹除", color: "#2a2a2a" },
  { number: "XII", name: "World Eaters", nameCN: "世界食子", primarch: "Angron", primarchCN: "安格隆", color: "#ffffff" },
  { number: "XIII", name: "Ultramarines", nameCN: "极限战士", primarch: "Roboute Guilliman", primarchCN: "罗伯特·基利曼", color: "#0000ff" },
  { number: "XIV", name: "Death Guard", nameCN: "死亡守卫", primarch: "Mortarion", primarchCN: "莫塔里安", color: "#2d5016" },
  { number: "XV", name: "Thousand Sons", nameCN: "千子", primarch: "Magnus the Red", primarchCN: "马格努斯", color: "#8b0000" },
  { number: "XVI", name: "Luna Wolves", nameCN: "月狼", primarch: "Horus Lupercal", primarchCN: "荷鲁斯", color: "#ffffff" },
  { number: "XVII", name: "Word Bearers", nameCN: "怀言者", primarch: "Lorgar Aurelian", primarchCN: "洛加尔", color: "#dc143c" },
  { number: "XVIII", name: "Salamanders", nameCN: "火蜥蜴", primarch: "Vulkan", primarchCN: "瓦肯", color: "#006400" },
];

const TheHorusHeresyPage = () => {
  return (
    <div>
      <Title level={2}>THE HORUS HERESY - Space Marine Legions</Title>
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
              title={`Legion ${legion.number}`}
              variant="outlined"
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: legion.color,
                color: legion.color === "#ffffff" || legion.color === "#ffd700" ? "#000000" : "#ffffff",
              }}
              styles={{
                header: {
                  backgroundColor: legion.color,
                  color: legion.color === "#ffffff" || legion.color === "#ffd700" ? "#000000" : "#ffffff",
                  borderBottom: `1px solid ${
                    legion.color === "#ffffff" || legion.color === "#ffd700" ? "#d9d9d9" : "rgba(255,255,255,0.2)"
                  }`,
                },
              }}
            >
              <div>
                <p style={{ marginBottom: 8 }}>
                  <strong>Legion Name:</strong> {legion.name}
                  <br />
                  <span style={{ fontSize: "0.9em", opacity: 0.9 }}>{legion.nameCN}</span>
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>Primarch:</strong> {legion.primarch}
                  <br />
                  <span style={{ fontSize: "0.9em", opacity: 0.9 }}>{legion.primarchCN}</span>
                </p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TheHorusHeresyPage;

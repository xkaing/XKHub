import { Typography, Table, Image, Tag, Tabs } from "antd";
import joytoyData from "../data/JOYTOY.json";

const { Title } = Typography;

const JOYTOYPage = () => {
  const getImageUrl = (url) => {
    try {
      // 使用 new URL 动态导入图片
      return new URL(url, import.meta.url).href;
    } catch (error) {
      console.error("加载图片失败:", error);
      return url;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "图片",
      dataIndex: "url",
      key: "url",
      width: 120,
      render: (url) => {
        const imageUrl = getImageUrl(url);
        return (
          <Image
            src={imageUrl}
            alt="JOYTOY"
            width={80}
            height={80}
            style={{ objectFit: "cover", borderRadius: "4px" }}
            preview={{
              mask: "预览",
            }}
          />
        );
      },
    },
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 120,
      sorter: (a, b) => new Date(a.time) - new Date(b.time),
    },
    {
      title: "原价",
      dataIndex: "originalPrice",
      key: "originalPrice",
      width: 100,
      sorter: (a, b) => parseFloat(a.originalPrice) - parseFloat(b.originalPrice),
      render: (price) => `¥${price}`,
    },
    {
      title: "买价",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      width: 100,
      sorter: (a, b) => parseFloat(a.purchasePrice) - parseFloat(b.purchasePrice),
      render: (price) => `¥${price}`,
    },
    {
      title: "节省",
      key: "savings",
      width: 100,
      render: (_, record) => {
        const savings = parseFloat(record.originalPrice) - parseFloat(record.purchasePrice);
        return savings > 0 ? (
          <span style={{ color: "#52c41a" }}>¥{savings.toFixed(0)}</span>
        ) : (
          <span style={{ color: "#999" }}>-</span>
        );
      },
    },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      width: 150,
      render: (tags) => (
        <>
          {tags.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  // 为每条数据添加唯一 key
  const dataSource = joytoyData.map((item, index) => ({
    ...item,
    key: index,
  }));

  // 计算汇总数据
  const totalOriginalPrice = joytoyData.reduce((sum, item) => sum + parseFloat(item.originalPrice || 0), 0);
  const totalPurchasePrice = joytoyData.reduce((sum, item) => sum + parseFloat(item.purchasePrice || 0), 0);
  const totalSavings = totalOriginalPrice - totalPurchasePrice;

  // 汇总行配置
  const summary = (pageData) => {
    return (
      <Table.Summary fixed>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={2}>
            <strong>合计</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={2}>
            <strong style={{ color: "#1890ff" }}>¥{totalOriginalPrice.toFixed(0)}</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={3}>
            <strong style={{ color: "#1890ff" }}>¥{totalPurchasePrice.toFixed(0)}</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={4}>
            <strong style={{ color: "#52c41a" }}>¥{totalSavings.toFixed(0)}</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} colSpan={1}></Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  // Tabs 配置
  const tabItems = [
    {
      key: "table",
      label: "表格",
      children: (
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          summary={summary}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>JOYTOY</Title>
      <Tabs defaultActiveKey="table" items={tabItems} />
    </div>
  );
};

export default JOYTOYPage;


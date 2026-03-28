'use client'

import { Typography, Table, Image, Tag, Tabs } from 'antd'
import joytoyData from '@/data/JOYTOY.json'

const { Title } = Typography

const getImageUrl = (url: string) => {
  if (url.startsWith('/')) return url
  if (url.startsWith('../assets/')) return url.replace('../assets/', '/assets/')
  return url
}

const getTagColor = (tag: string) => {
  const colorMap: Record<string, string> = {
    '待发货': 'red',
    '40K': 'blue',
    '30K': 'orange',
    'The Horus Heresy': 'purple',
    'Space Marine 2': 'green',
  }
  return colorMap[tag] || 'default'
}

export default function JOYTOYPage() {
  const columns = [
    {
      title: '图片',
      dataIndex: 'url',
      key: 'url',
      width: 120,
      render: (url: string) => (
        <Image
          src={getImageUrl(url)}
          alt="JOYTOY"
          width={80}
          height={80}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          preview={{ mask: '预览' }}
        />
      ),
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 120,
      sorter: (a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    },
    {
      title: '原价',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      width: 100,
      sorter: (a: any, b: any) => parseFloat(a.originalPrice) - parseFloat(b.originalPrice),
      render: (price: string) => `¥${price}`,
    },
    {
      title: '买价',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      width: 100,
      sorter: (a: any, b: any) => parseFloat(a.purchasePrice) - parseFloat(b.purchasePrice),
      render: (price: string) => `¥${price}`,
    },
    {
      title: '节省',
      key: 'savings',
      width: 100,
      render: (_: any, record: any) => {
        const savings = parseFloat(record.originalPrice) - parseFloat(record.purchasePrice)
        return savings > 0 ? (
          <span style={{ color: '#52c41a' }}>¥{savings.toFixed(0)}</span>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => tags.map((tag) => <Tag key={tag} color={getTagColor(tag)}>{tag}</Tag>),
    },
  ]

  const dataSource = joytoyData.map((item, index) => ({ ...item, key: index }))

  const totalOriginalPrice = joytoyData.reduce((sum, item) => sum + parseFloat(item.originalPrice || '0'), 0)
  const totalPurchasePrice = joytoyData.reduce((sum, item) => sum + parseFloat(item.purchasePrice || '0'), 0)
  const totalSavings = totalOriginalPrice - totalPurchasePrice

  const summary = (pageData: any) => (
    <Table.Summary fixed>
      <Table.Summary.Row>
        <Table.Summary.Cell index={0} colSpan={2}>
          <strong>合计</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={2}>
          <strong style={{ color: '#1890ff' }}>¥{totalOriginalPrice.toFixed(0)}</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={3}>
          <strong style={{ color: '#1890ff' }}>¥{totalPurchasePrice.toFixed(0)}</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={4}>
          <strong style={{ color: '#52c41a' }}>¥{totalSavings.toFixed(0)}</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={5} colSpan={1}></Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  )

  return (
    <div>
      <Title level={2}>JOYTOY</Title>
      <Tabs
        defaultActiveKey="table"
        items={[
          {
            key: 'table',
            label: '表格',
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
        ]}
      />
    </div>
  )
}
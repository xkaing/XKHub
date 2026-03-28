'use client'

import { useState, useEffect } from 'react'
import { Typography, Table, Avatar, Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils/dateFormat'

const { Title } = Typography

export default function MomentsPage() {
  const [moments, setMoments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMoments = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('moments')
        .select('*')
        .order('publish_time', { ascending: false })
      setMoments(data || [])
      setLoading(false)
    }
    fetchMoments()
  }, [])

  const momentsColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
      render: (userName: string) => userName || '-',
    },
    {
      title: '用户头像',
      dataIndex: 'user_avatar_url',
      key: 'user_avatar_url',
      width: 100,
      render: (avatarUrl: string) => <Avatar src={avatarUrl} icon={<UserOutlined />} size={40} />,
    },
    {
      title: '发布时间',
      dataIndex: 'publish_time',
      key: 'publish_time',
      width: 180,
      render: (publishTime: string) => formatDateTime(publishTime),
    },
    {
      title: '内容',
      dataIndex: 'content_text',
      key: 'content_text',
      width: 300,
      render: (contentText: string) => (
        <div style={{ maxWidth: '300px', wordWrap: 'break-word', wordBreak: 'break-word' }}>
          {contentText || '-'}
        </div>
      ),
    },
    {
      title: '内容图片',
      dataIndex: 'content_img_url',
      key: 'content_img_url',
      width: 200,
      render: (imgUrl: string) => {
        if (!imgUrl) return '-'
        return (
          <img
            src={imgUrl}
            alt="内容图片"
            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '4px' }}
          />
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: () => <Button>AI评论</Button>,
    },
  ]

  return (
    <div>
      <Title level={2}>社区动态</Title>
      <Table
        columns={momentsColumns}
        dataSource={moments}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  )
}
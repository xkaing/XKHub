'use client'

import { useState, useEffect } from 'react'
import { Typography, Table, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils/dateFormat'
import type { Profile, AIBot } from '@/types'

const { Title } = Typography

export default function AccountsPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [bots, setBots] = useState<AIBot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [usersResponse, botsResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('ai_bots').select('*').order('created_at', { ascending: false }),
      ])
      setUsers(usersResponse.data || [])
      setBots(botsResponse.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const userColumns = [
    {
      title: '头像',
      dataIndex: 'avatar_url',
      key: 'avatar_url',
      width: 80,
      render: (avatarUrl: string) => <Avatar src={avatarUrl} icon={<UserOutlined />} size={40} />,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (nickname: string) => nickname || '未设置',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt: string) => formatDateTime(createdAt),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (updatedAt: string) => formatDateTime(updatedAt),
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_sign_in_at',
      key: 'last_sign_in_at',
      render: (lastSignInAt: string) => formatDateTime(lastSignInAt),
    },
  ]

  const botColumns = [
    {
      title: '头像',
      dataIndex: 'avatar_url',
      key: 'avatar_url',
      width: 80,
      render: (avatarUrl: string) => <Avatar src={avatarUrl} icon={<UserOutlined />} size={40} />,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (nickname: string) => nickname || '未设置',
    },
    {
      title: '介绍',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '-',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt: string) => formatDateTime(createdAt),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (updatedAt: string) => formatDateTime(updatedAt),
    },
  ]

  return (
    <div>
      <Title level={2}>账号管理</Title>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>用户列表</Title>
        <Table
          columns={userColumns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>
      <div>
        <Title level={4}>机器人列表</Title>
        <Table
          columns={botColumns}
          dataSource={bots}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>
    </div>
  )
}
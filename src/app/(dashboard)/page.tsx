'use client'

import { Typography } from 'antd'

const { Title } = Typography

export default function DefaultPage() {
  return (
    <div>
      <Title level={2}>Welcome to XKHub</Title>
      <p>Default Page</p>
    </div>
  )
}
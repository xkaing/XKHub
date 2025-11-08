import { useState } from 'react'
import { Layout, Menu, Typography, Card } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import './App.css'

const { Header, Sider, Content } = Layout
const { Title } = Typography

// PSN 页面内容
const PSNContent = () => {
  return (
    <Card>
      <Title level={2}>PSN</Title>
      <p>这是 PSN 页面的内容区域</p>
    </Card>
  )
}

// W40K 页面内容
const W40KContent = () => {
  return (
    <Card>
      <Title level={2}>W40K</Title>
      <p>这是 W40K 页面的内容区域</p>
    </Card>
  )
}

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState('psn')

  const menuItems = [
    {
      key: 'psn',
      label: 'PSN',
    },
    {
      key: 'w40k',
      label: 'W40K',
    },
  ]

  const renderContent = () => {
    switch (selectedKey) {
      case 'psn':
        return <PSNContent />
      case 'w40k':
        return <W40KContent />
      default:
        return <PSNContent />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'XK' : 'XKHub'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16
        }}>
          {collapsed ? (
            <MenuUnfoldOutlined 
              className="trigger" 
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer' }}
            />
          ) : (
            <MenuFoldOutlined 
              className="trigger" 
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer' }}
            />
          )}
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280,
          background: '#fff'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

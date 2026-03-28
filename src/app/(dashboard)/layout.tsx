'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Card, Menu, Avatar, Button, App, Switch, Dropdown } from 'antd'
import {
  UserOutlined,
  EditOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  BulbOutlined,
  FolderOpenOutlined,
  TrophyOutlined,
  BankOutlined,
  TagOutlined,
  AppleOutlined,
  TeamOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { createClient } from '@/lib/supabase/client'
import { logoutAction } from '@/lib/supabase/auth'
import EditProfileModal from '@/components/dashboard/EditProfileModal'
import AddBotModal from '@/components/dashboard/AddBotModal'
import type { Profile, AIBot } from '@/types'

const menuItems: MenuProps['items'] = [
  {
    key: 'psn',
    label: 'PSN',
    icon: <FolderOpenOutlined />,
    children: [
      {
        key: '/psn/trophies',
        label: 'PSN TROPHIES',
        icon: <TrophyOutlined />,
      },
      {
        key: '/psn/companies',
        label: 'GAME COMPANY',
        icon: <BankOutlined />,
      },
      {
        key: '/psn/ips',
        label: 'GAME IP',
        icon: <TagOutlined />,
      },
    ],
  },
  {
    key: 'warhammer',
    label: 'Warhammer',
    icon: <DatabaseOutlined />,
    children: [
      {
        key: '/warhammer/30k',
        label: '30K',
        icon: <FolderOpenOutlined />,
      },
      {
        key: '/warhammer/40k',
        label: '40K',
        icon: <FolderOpenOutlined />,
      },
      {
        key: '/warhammer/joytoy',
        label: 'JOYTOY',
        icon: <FolderOpenOutlined />,
      },
    ],
  },
  {
    key: 'xkailive',
    label: 'XKALLive',
    icon: <AppleOutlined />,
    children: [
      {
        key: '/accounts',
        label: 'Accounts',
        icon: <TeamOutlined />,
      },
      {
        key: '/moments',
        label: 'Moments',
        icon: <CloudServerOutlined />,
      },
    ],
  },
]

const themeMenuItems = [
  { key: 'light', label: 'Light', icon: <SunOutlined /> },
  { key: 'dark', label: 'Dark', icon: <MoonOutlined /> },
  { key: 'auto', label: 'Auto', icon: <BulbOutlined /> },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { message } = App.useApp()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [userInfoCollapsed, setUserInfoCollapsed] = useState(false)
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addBotModalVisible, setAddBotModalVisible] = useState(false)
  const [bots, setBots] = useState<AIBot[]>([])

  const getCurrentTheme = useCallback((): 'light' | 'dark' => {
    if (themeMode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themeMode
  }, [themeMode])

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        await fetchProfile(currentUser.id)
        await fetchBots()
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as 'light' | 'dark' | 'auto' | null
    if (stored) {
      setThemeMode(stored)
    }
  }, [])

  useEffect(() => {
    const theme = getCurrentTheme()
    document.documentElement.setAttribute('data-theme', theme)
  }, [themeMode, getCurrentTheme])

  const fetchProfile = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
    }
  }

  const fetchBots = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('ai_bots').select('*').order('created_at', { ascending: false })
    if (data) {
      setBots(data)
    }
  }

  const handleThemeChange = (key: string) => {
    setThemeMode(key as 'light' | 'dark' | 'auto')
    localStorage.setItem('themeMode', key)
  }

  const getUserDisplayName = () => {
    if (profile?.nickname) return profile.nickname
    if (user?.email) return user.email.split('@')[0]
    return '用户'
  }

  const getUserAvatar = () => {
    return profile?.avatar_url || null
  }

  const handleLogout = async () => {
    try {
      await logoutAction()
    } catch {
      message.error('退出登录失败，请稍后重试')
    }
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    router.push(key)
  }

  const getSelectedKey = () => {
    const pathKeyMap: Record<string, string> = {
      '/psn/trophies': 'psn-trophies',
      '/psn/companies': 'psn-companies',
      '/psn/ips': 'psn-ips',
      '/warhammer/30k': 'warhammer-30k',
      '/warhammer/40k': 'warhammer-40k',
      '/warhammer/joytoy': 'warhammer-joytoy',
      '/accounts': 'xkailive-account',
      '/moments': 'xkailive-moments',
    }
    return pathKeyMap[pathname] || 'xkailive-account'
  }

  const getOpenKeys = () => {
    if (pathname.startsWith('/psn')) return ['psn']
    if (pathname.startsWith('/warhammer')) return ['warhammer']
    if (pathname.startsWith('/accounts') || pathname.startsWith('/moments')) return ['xkailive']
    return ['xkailive']
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        加载中...
      </div>
    )
  }

  const currentTheme = getCurrentTheme()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: currentTheme === 'dark' ? '#141414' : '#f5f5f5',
        padding: '20px',
        display: 'flex',
        gap: '20px',
        transition: 'background-color 0.3s',
      }}
    >
      <Card
        style={{
          width: collapsed ? 80 : 240,
          height: 'calc(100vh - 40px)',
          padding: 0,
          transition: 'width 0.2s',
          borderRadius: '12px',
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
        }}
        styles={{
          body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' },
        }}
      >
        <div
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed || userInfoCollapsed ? 'center' : 'flex-start',
            gap: '12px',
            transition: 'all 0.2s',
          }}
        >
          <div
            onClick={() => setUserInfoCollapsed(!userInfoCollapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 1,
              minWidth: 0,
              cursor: 'pointer',
            }}
          >
            <Avatar
              size={40}
              src={getUserAvatar()}
              icon={<UserOutlined />}
              style={{ flexShrink: 0 }}
            />
            {!collapsed && !userInfoCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '15px',
                    color: currentTheme === 'dark' ? '#fff' : '#333',
                    lineHeight: '20px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getUserDisplayName()}
                </div>
                {user?.email && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: currentTheme === 'dark' ? '#999' : '#666',
                      lineHeight: '18px',
                      marginTop: '2px',
                    }}
                  >
                    {user.email}
                  </div>
                )}
              </div>
            )}
          </div>
          {!collapsed && !userInfoCollapsed && (
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{
                color: currentTheme === 'dark' ? '#999' : '#666',
                padding: '4px 8px',
                minWidth: 'auto',
                height: 'auto',
              }}
              onClick={(e) => {
                e.stopPropagation()
                setEditModalVisible(true)
              }}
            />
          )}
        </div>

        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            margin: '8px 16px',
            color: currentTheme === 'dark' ? '#999' : '#666',
          }}
        />

        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            borderRight: 'none',
            background: 'transparent',
            padding: '8px',
          }}
          styles={{
            item: {
              color: currentTheme === 'dark' ? '#fff' : '#333',
              borderRadius: '8px',
              marginBottom: '4px',
            },
            selectedItem: {
              color: '#1890ff !important',
              background: 'transparent !important',
            },
            subMenuItem: {
              color: currentTheme === 'dark' ? '#e0e0e0' : '#333',
            },
          }}
        />

        <div
          style={{
            padding: '16px',
            borderTop: currentTheme === 'dark' ? '1px solid #2a2a2a' : '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {themeMenuItems.map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleThemeChange(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background:
                      themeMode === item.key
                        ? currentTheme === 'dark'
                          ? '#2a2a2a'
                          : '#f5f5f5'
                        : 'transparent',
                    color:
                      themeMode === item.key
                        ? '#1890ff'
                        : currentTheme === 'dark'
                          ? '#fff'
                          : '#666',
                    fontWeight: themeMode === item.key ? 500 : 400,
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {!collapsed && (
            <div
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: 'transparent',
                color: '#ff4d4f',
                fontWeight: 400,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = currentTheme === 'dark' ? '#2a2a2a' : '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: '16px' }}>
                <LogoutOutlined />
              </span>
              <span>Logout</span>
            </div>
          )}

          {collapsed && (
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                marginTop: '8px',
              }}
            />
          )}
        </div>
      </Card>

      <Card
        style={{
          flex: 1,
          height: 'calc(100vh - 40px)',
          overflow: 'auto',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          padding: '24px',
        }}
      >
        {children}
      </Card>

      <EditProfileModal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        user={user}
        profile={profile}
        currentTheme={currentTheme}
        onProfileUpdate={() => fetchProfile(user?.id)}
      />

      <AddBotModal
        open={addBotModalVisible}
        onCancel={() => setAddBotModalVisible(false)}
        onSuccess={fetchBots}
      />
    </div>
  )
}

import { useState, useEffect } from "react";
import { ConfigProvider, Menu, Typography, Card, Avatar, Tabs, Table } from "antd";
import { theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  TrophyOutlined,
  BankOutlined,
  TagOutlined,
  ThunderboltOutlined,
  BookOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  AppleOutlined,
  CloudServerOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { supabase } from "./lib/supabase";
import Login from "./components/Login";
import "./App.css";

const { Title } = Typography;

// PSN 奖杯页面内容
const PSNTrophiesContent = () => {
  return (
    <div>
      <Title level={2}>PSN奖杯</Title>
      <p>这是 PSN 奖杯页面的内容区域</p>
    </div>
  );
};

// 游戏公司页面内容
const GameCompaniesContent = () => {
  return (
    <div>
      <Title level={2}>游戏公司</Title>
      <p>这是游戏公司页面的内容区域</p>
    </div>
  );
};

// 游戏IP页面内容
const GameIPsContent = () => {
  return (
    <div>
      <Title level={2}>游戏IP</Title>
      <p>这是游戏IP页面的内容区域</p>
    </div>
  );
};

// W40K 页面内容
const W40KContent = () => {
  return (
    <div>
      <Title level={2}>W40K</Title>
      <p>这是 W40K 页面的内容区域</p>
    </div>
  );
};

// 动态管理页面内容
const MomentsContent = () => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取动态列表
  const fetchMoments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("moments").select("*").order("publish_time", { ascending: false });

      if (error) {
        console.error("获取动态列表失败:", error);
        return;
      }

      setMoments(data || []);
    } catch (error) {
      console.error("获取动态列表异常:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  // 表格列定义
  const momentsColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "用户名",
      dataIndex: "user_name",
      key: "user_name",
      width: 120,
      render: (userName) => userName || "-",
    },
    {
      title: "用户头像",
      dataIndex: "user_avatar_url",
      key: "user_avatar_url",
      width: 100,
      render: (avatarUrl) => <Avatar src={avatarUrl} icon={<UserOutlined />} size={40} />,
    },
    {
      title: "发布时间",
      dataIndex: "publish_time",
      key: "publish_time",
      width: 180,
      render: (publishTime) => {
        if (!publishTime) return "-";
        return new Date(publishTime).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      title: "内容",
      dataIndex: "content_text",
      key: "content_text",
      width: 300,
      render: (contentText) => (
        <div
          style={{
            maxWidth: "300px",
            wordWrap: "break-word",
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          {contentText || "-"}
        </div>
      ),
    },
    {
      title: "内容图片",
      dataIndex: "content_img_url",
      key: "content_img_url",
      width: 200,
      render: (imgUrl) => {
        if (!imgUrl) return "-";
        return (
          <img
            src={imgUrl}
            alt="内容图片"
            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "4px" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        );
      },
    },
  ];

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
  );
};

// XKALLive 页面内容
const XKALLiveContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

      if (error) {
        console.error("获取用户列表失败:", error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error("获取用户列表异常:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 表格列定义
  const userColumns = [
    {
      title: "头像",
      dataIndex: "avatar_url",
      key: "avatar_url",
      width: 80,
      render: (avatarUrl) => <Avatar src={avatarUrl} icon={<UserOutlined />} size={40} />,
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      render: (nickname) => nickname || "未设置",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      render: (email) => email || "-",
    },

    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt) => {
        if (!createdAt) return "-";
        return new Date(createdAt).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updatedAt) => {
        if (!updatedAt) return "-";
        return new Date(updatedAt).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      title: "最后登录时间",
      dataIndex: "last_sign_in_at",
      key: "last_sign_in_at",
      render: (lastSignInAt) => {
        if (!lastSignInAt) return "-";
        return new Date(lastSignInAt).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
  ];

  const tabItems = [
    {
      key: "users",
      label: "用户",
      children: (
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
      ),
    },
    {
      key: "bots",
      label: "机器人",
      children: <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>机器人管理功能开发中...</div>,
    },
  ];

  return (
    <div>
      <Title level={2}>账号管理</Title>
      <Tabs items={tabItems} />
    </div>
  );
};

// 默认页面
const DefaultContent = () => {
  return (
    <div>
      <Title level={2}>Default</Title>
      <p>这是默认页面的内容区域</p>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [userInfoCollapsed, setUserInfoCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("psn-trophies");
  const [openKeys, setOpenKeys] = useState(["psn"]);
  const [themeMode, setThemeMode] = useState(() => {
    // 从 localStorage 读取保存的主题设置
    return localStorage.getItem("themeMode") || "light";
  });

  // 检查用户登录状态
  useEffect(() => {
    checkUser();

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 检查当前用户
  const checkUser = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(currentUser);
      }
    } catch (error) {
      console.error("检查用户状态失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户资料
  const fetchUserProfile = async (userData) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userData.id).single();

      if (error) {
        console.error("获取用户资料失败:", error);
        // 如果 profiles 表不存在或没有数据，使用默认值
        setProfile({
          avatar_url: null,
          username: userData?.email?.split("@")[0] || "用户",
        });
      } else {
        setProfile(
          data || {
            avatar_url: null,
            username: userData?.email?.split("@")[0] || "用户",
          }
        );
      }
    } catch (error) {
      console.error("获取用户资料异常:", error);
      setProfile({
        avatar_url: null,
        username: userData?.email?.split("@")[0] || "用户",
      });
    }
  };

  // 处理登录成功
  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    await fetchUserProfile(userData);
  };

  // 监听系统主题变化
  useEffect(() => {
    if (themeMode === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        // 当系统主题变化时，更新应用主题
        document.documentElement.setAttribute("data-theme", mediaQuery.matches ? "dark" : "light");
      };
      handleChange(); // 初始化
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      document.documentElement.setAttribute("data-theme", themeMode);
    }
  }, [themeMode]);

  // 保存主题设置到 localStorage
  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  // 获取当前实际主题（考虑 auto 模式）
  const getCurrentTheme = () => {
    if (themeMode === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return themeMode;
  };

  // 配置 Ant Design 主题
  const currentTheme = getCurrentTheme();
  const antdTheme = {
    algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  const menuItems = [
    {
      key: "psn",
      label: "PSN",
      icon: <FolderOpenOutlined />,
      children: [
        {
          key: "psn-trophies",
          label: "PSN TROPHIES",
          icon: <TrophyOutlined />,
        },
        {
          key: "psn-companies",
          label: "GAME COMPANY",
          icon: <BankOutlined />,
        },
        {
          key: "psn-ips",
          label: "GAME IP",
          icon: <TagOutlined />,
        },
      ],
    },
    {
      key: "warhammer",
      label: "Warhammer",
      icon: <FolderOpenOutlined />,
      children: [
        {
          key: "warhammer-40k",
          label: "40K",
          icon: <FileTextOutlined />,
        },
        {
          key: "warhammer-the-horus-heresy",
          label: "THE HORUS HERESY",
          icon: <FileTextOutlined />,
        },
      ],
    },
    {
      key: "xkailive",
      label: "XKALLive",
      icon: <AppleOutlined />,
      children: [
        {
          key: "xkailive-account",
          label: "Accounts",
          icon: <TeamOutlined />,
        },
        {
          key: "xkailive-moments",
          label: "Moments",
          icon: <CloudServerOutlined />,
        },
      ],
    },
  ];

  // 主题切换菜单项
  const themeMenuItems = [
    {
      key: "light",
      label: "Light",
      icon: <SunOutlined />,
    },
    {
      key: "dark",
      label: "Dark",
      icon: <MoonOutlined />,
    },
    {
      key: "auto",
      label: "Auto",
      icon: <BulbOutlined />,
    },
  ];

  // 获取当前主题的图标
  const getThemeIcon = () => {
    switch (themeMode) {
      case "light":
        return <SunOutlined />;
      case "dark":
        return <MoonOutlined />;
      case "auto":
        return <BulbOutlined />;
      default:
        return <BulbOutlined />;
    }
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "psn-trophies":
        return <PSNTrophiesContent />;
      case "psn-companies":
        return <GameCompaniesContent />;
      case "psn-ips":
        return <GameIPsContent />;
      case "warhammer-40k":
        return <W40KContent />;
      case "xkailive-account":
        return <XKALLiveContent />;
      case "xkailive-moments":
        return <MomentsContent />;
      default:
        return <DefaultContent />;
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <ConfigProvider theme={antdTheme}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div>加载中...</div>
        </div>
      </ConfigProvider>
    );
  }

  // 如果未登录，显示登录页面
  if (!user) {
    return (
      <ConfigProvider theme={antdTheme}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ConfigProvider>
    );
  }

  // 获取用户显示名称
  const getUserDisplayName = () => {
    if (profile?.nickname) {
      return profile.nickname;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "用户";
  };

  // 获取用户头像
  const getUserAvatar = () => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    return null;
  };

  // 切换用户信息显示（点击用户信息区域时）
  const toggleUserInfo = () => {
    setUserInfoCollapsed(!userInfoCollapsed);
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        style={{
          minHeight: "100vh",
          background: currentTheme === "dark" ? "#141414" : "#f5f5f5",
          padding: "20px",
          display: "flex",
          gap: "20px",
          transition: "background-color 0.3s",
        }}
      >
        <Card
          className="sidebar-card"
          style={{
            width: collapsed ? 80 : 240,
            height: "calc(100vh - 40px)",
            padding: 0,
            transition: "width 0.2s",
            borderRadius: "12px",
            background: "transparent",
            boxShadow: "none",
            border: "none",
          }}
          styles={{ body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" } }}
        >
          <div
            className="user-profile-section"
            onClick={toggleUserInfo}
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed || userInfoCollapsed ? "center" : "flex-start",
              gap: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Avatar
              size={collapsed || userInfoCollapsed ? 40 : 40}
              src={getUserAvatar()}
              icon={<UserOutlined />}
              style={{ flexShrink: 0 }}
            />
            {!collapsed && !userInfoCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "15px",
                    color: currentTheme === "dark" ? "#fff" : "#333",
                    lineHeight: "20px",
                  }}
                >
                  {getUserDisplayName()}
                </div>
                {user?.email && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: currentTheme === "dark" ? "#999" : "#666",
                      lineHeight: "18px",
                      marginTop: "2px",
                    }}
                  >
                    {user.email}
                  </div>
                )}
              </div>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
            className="custom-sidebar-menu"
            style={{
              flex: 1,
              borderRight: "none",
              background: "transparent",
              padding: "8px",
            }}
          />
          <div
            style={{
              padding: "16px",
              borderTop: currentTheme === "dark" ? "1px solid #2a2a2a" : "1px solid #f0f0f0",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {!collapsed && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  marginBottom: "8px",
                }}
              >
                {themeMenuItems.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => setThemeMode(item.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background:
                        themeMode === item.key ? (currentTheme === "dark" ? "#2a2a2a" : "#f5f5f5") : "transparent",
                      color:
                        themeMode === item.key
                          ? currentTheme === "dark"
                            ? "#1890ff"
                            : "#1890ff"
                          : currentTheme === "dark"
                          ? "#fff"
                          : "#666",
                      fontWeight: themeMode === item.key ? 500 : 400,
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
            {/* {collapsed ? (
              <MenuUnfoldOutlined
                className="trigger"
                onClick={() => setCollapsed(false)}
                style={{
                  fontSize: 18,
                  cursor: "pointer",
                  color: currentTheme === "dark" ? "#fff" : "#666",
                  alignSelf: "center",
                }}
              />
            ) : (
              <MenuFoldOutlined
                className="trigger"
                onClick={() => setCollapsed(true)}
                style={{
                  fontSize: 18,
                  cursor: "pointer",
                  color: currentTheme === "dark" ? "#fff" : "#666",
                  alignSelf: "center",
                }}
              />
            )} */}
          </div>
        </Card>
        <Card
          className="content-card"
          style={{
            flex: 1,
            height: "calc(100vh - 40px)",
            overflow: "auto",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            padding: "24px",
          }}
        >
          {renderContent()}
        </Card>
      </div>
    </ConfigProvider>
  );
}

export default App;

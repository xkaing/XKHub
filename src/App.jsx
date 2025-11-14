import { useState, useEffect } from "react";
import { ConfigProvider, Menu, Typography, Card, Dropdown, Button, Avatar } from "antd";
import { theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
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

// XKALLive 页面内容
const XKALLiveContent = () => {
  return (
    <div>
      <Title level={2}>XKALLive</Title>
      <p>这是 XKALLive 页面的内容区域</p>
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
      console.log("获取用户信息：", data);

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
      children: [
        {
          key: "psn-trophies",
          label: "PSN TROPHIES",
        },
        {
          key: "psn-companies",
          label: "GAME COMPANY",
        },
        {
          key: "psn-ips",
          label: "GAME IP",
        },
      ],
    },
    {
      key: "warhammer",
      label: "Warhammer",
      children: [
        {
          key: "warhammer-40k",
          label: "40K",
        },
        {
          key: "warhammer-the-horus-heresy",
          label: "THE HORUS HERESY",
        },
      ],
    },
    {
      key: "xkailive",
      label: "XKALLive",
      children: [
        {
          key: "xkailive-account-management",
          label: "Account Management",
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
      case "xkailive-account-management":
        return <XKALLiveContent />;
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
          background: currentTheme === "dark" ? "#141414" : "#f0f2f5",
          padding: "16px",
          display: "flex",
          gap: "16px",
          transition: "background-color 0.3s",
        }}
      >
        <Card
          style={{
            width: collapsed ? 80 : 200,
            height: "calc(100vh - 32px)",
            padding: 0,
            transition: "width 0.2s",
          }}
          bodyStyle={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            className="logo"
            onClick={toggleUserInfo}
            style={{
              height: 64,
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed || userInfoCollapsed ? "center" : "flex-start",
              gap: "12px",
              color: "#1890ff",
              fontWeight: "bold",
              fontSize: collapsed || userInfoCollapsed ? 16 : 14,
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Avatar
              size={collapsed || userInfoCollapsed ? 32 : 28}
              src={getUserAvatar()}
              icon={<UserOutlined />}
              style={{ flexShrink: 0 }}
            />
            {!collapsed && !userInfoCollapsed && (
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {getUserDisplayName()}
              </span>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
            style={{
              flex: 1,
              borderRight: "none",
            }}
          />
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <Dropdown
              menu={{
                items: themeMenuItems,
                selectedKeys: [themeMode],
                onClick: ({ key }) => setThemeMode(key),
              }}
              placement="top"
            >
              <Button
                type="text"
                icon={getThemeIcon()}
                style={{
                  width: collapsed ? "auto" : "100%",
                  fontSize: collapsed ? 18 : undefined,
                  color: "#1890ff",
                }}
              >
                {!collapsed && "主题"}
              </Button>
            </Dropdown>
            {collapsed ? (
              <MenuUnfoldOutlined
                className="trigger"
                onClick={() => setCollapsed(false)}
                style={{ fontSize: 18, cursor: "pointer", color: "#1890ff" }}
              />
            ) : (
              <MenuFoldOutlined
                className="trigger"
                onClick={() => setCollapsed(true)}
                style={{ fontSize: 18, cursor: "pointer", color: "#1890ff" }}
              />
            )}
          </div>
        </Card>
        <Card
          style={{
            flex: 1,
            height: "calc(100vh - 32px)",
            overflow: "auto",
          }}
        >
          {renderContent()}
        </Card>
      </div>
    </ConfigProvider>
  );
}

export default App;

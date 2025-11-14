import { useState } from "react";
import { ConfigProvider, Card } from "antd";
import { theme } from "antd";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { routeConfig } from "./config/routes";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  const { user, profile, loading, handleLoginSuccess, handleLogout } = useAuth();
  const { themeMode, setThemeMode, getCurrentTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [userInfoCollapsed, setUserInfoCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("psn-trophies");
  const [openKeys, setOpenKeys] = useState(["psn"]);

  // 配置 Ant Design 主题
  const currentTheme = getCurrentTheme();
  const antdTheme = {
    algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  // 渲染页面内容
  const renderContent = () => {
    const PageComponent = routeConfig[selectedKey] || routeConfig.default;
    return <PageComponent />;
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <ConfigProvider theme={antdTheme}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
        <Sidebar
          user={user}
          profile={profile}
          collapsed={collapsed}
          selectedKey={selectedKey}
          openKeys={openKeys}
          onOpenKeysChange={setOpenKeys}
          onMenuClick={({ key }) => setSelectedKey(key)}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
          currentTheme={currentTheme}
          userInfoCollapsed={userInfoCollapsed}
          onToggleUserInfo={() => setUserInfoCollapsed(!userInfoCollapsed)}
          onLogout={handleLogout}
        />
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
import { Card, Menu, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { menuItems } from "../constants/menuItems";
import { themeMenuItems } from "../constants/themeMenuItems";

const Sidebar = ({
  user,
  profile,
  collapsed,
  selectedKey,
  openKeys,
  onOpenKeysChange,
  onMenuClick,
  themeMode,
  onThemeChange,
  currentTheme,
  userInfoCollapsed,
  onToggleUserInfo,
}) => {
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

  return (
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
      styles={{
        body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" },
      }}
    >
      <div
        className="user-profile-section"
        onClick={onToggleUserInfo}
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
        onOpenChange={onOpenKeysChange}
        items={menuItems}
        onClick={onMenuClick}
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
                onClick={() => onThemeChange(item.key)}
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
      </div>
    </Card>
  );
};

export default Sidebar;

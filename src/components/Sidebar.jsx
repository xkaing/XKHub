import { useState } from "react";
import { Card, Menu, Avatar, Button, Modal, Form, Input, Upload, App } from "antd";
import { UserOutlined, EditOutlined, LogoutOutlined, UploadOutlined } from "@ant-design/icons";
import { menuItems } from "../constants/menuItems";
import { themeMenuItems } from "../constants/themeMenuItems";
import { supabase } from "../lib/supabase";
import supabaseConfig from "../../superbase.json";

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
  onLogout,
  onProfileUpdate,
}) => {
  const { message } = App.useApp();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [originalNickname, setOriginalNickname] = useState("");
  const [originalAvatar, setOriginalAvatar] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
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

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await onLogout();
      message.success("已退出登录");
    } catch (error) {
      message.error("退出登录失败，请稍后重试");
    }
  };

  // 打开编辑对话框
  const handleEditClick = () => {
    const initialNickname = profile?.nickname || "";
    const initialAvatar = profile?.avatar_url || null;

    form.setFieldsValue({
      nickname: initialNickname,
    });
    setPreviewAvatar(initialAvatar);
    setOriginalNickname(initialNickname);
    setOriginalAvatar(initialAvatar);
    setHasChanges(false);
    setEditModalVisible(true);
  };

  // 检查是否有变化
  const checkChanges = () => {
    const currentNickname = form.getFieldValue("nickname")?.trim() || "";
    const currentAvatar = previewAvatar;

    const nicknameChanged = currentNickname !== (originalNickname || "");
    const avatarChanged = currentAvatar !== originalAvatar;

    setHasChanges(nicknameChanged || avatarChanged);
  };

  // 上传头像
  const handleAvatarUpload = async (file) => {
    if (!user?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${supabaseConfig.SupabaseConfig.avatarPathPrefix}/${fileName}`;

      // 上传文件到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(supabaseConfig.SupabaseConfig.imageBucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 获取公共 URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(supabaseConfig.SupabaseConfig.imageBucket).getPublicUrl(filePath);

      // 更新 profile
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: publicUrl,
        nickname: form.getFieldValue("nickname") || profile?.nickname || null,
        email: user.email,
      });

      if (updateError) {
        throw updateError;
      }

      message.success("头像上传成功！");
      setPreviewAvatar(publicUrl);
      // 立即更新 profile 状态
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      // 检查是否有变化
      setTimeout(() => checkChanges(), 0);
      return publicUrl;
    } catch (error) {
      console.error("上传头像失败:", error);
      message.error("上传头像失败，请稍后重试");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 保存用户资料
  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      const nickname = values.nickname?.trim() || null;

      // 更新 profile（如果上传了新头像，使用预览头像；否则使用原有头像）
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        nickname: nickname,
        email: user.email,
        avatar_url: previewAvatar || profile?.avatar_url || null,
      });

      if (error) {
        throw error;
      }

      message.success("资料更新成功！");
      setEditModalVisible(false);
      setPreviewAvatar(null);
      setHasChanges(false);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error("更新资料失败:", error);
      message.error("更新资料失败，请稍后重试");
    }
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
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed || userInfoCollapsed ? "center" : "flex-start",
          gap: "12px",
          transition: "all 0.2s",
        }}
      >
        <div
          onClick={onToggleUserInfo}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
            minWidth: 0,
            cursor: "pointer",
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
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
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
        {!collapsed && !userInfoCollapsed && (
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{
              color: currentTheme === "dark" ? "#999" : "#666",
              padding: "4px 8px",
              minWidth: "auto",
              height: "auto",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick();
            }}
          />
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
        {!collapsed && (
          <div
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: "transparent",
              color: currentTheme === "dark" ? "#ff4d4f" : "#ff4d4f",
              fontWeight: 400,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentTheme === "dark" ? "#2a2a2a" : "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: "16px" }}>
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
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              marginTop: "8px",
            }}
          />
        )}
      </div>

      {/* 编辑用户资料对话框 */}
      <Modal
        title="编辑资料"
        open={editModalVisible}
        onOk={handleSaveProfile}
        onCancel={() => {
          setEditModalVisible(false);
          setPreviewAvatar(null);
          setHasChanges(false);
        }}
        okText="保存"
        cancelText="取消"
        confirmLoading={uploading}
        okButtonProps={{ disabled: !hasChanges }}
        styles={{
          body: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ width: "100%", maxWidth: "400px" }}
          labelCol={{ style: { textAlign: "center" } }}
          onValuesChange={checkChanges}
        >
          <Form.Item label="头像" name="avatar" style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={(file) => {
                  // 检查文件类型
                  const isValidType = supabaseConfig.SupabaseConfig.allowedImageMimeTypes.includes(file.type);
                  if (!isValidType) {
                    message.error("只支持 JPG、PNG、GIF、WEBP 格式的图片");
                    return false;
                  }

                  // 检查文件大小（5MB）
                  const isLt5M = file.size / 1024 / 1024 < supabaseConfig.SupabaseConfig.maxFileSize / 1024 / 1024;
                  if (!isLt5M) {
                    message.error("图片大小不能超过 5MB");
                    return false;
                  }

                  handleAvatarUpload(file);
                  return false; // 阻止自动上传
                }}
              >
                <div style={{ position: "relative", cursor: "pointer" }}>
                  <Avatar
                    size={120}
                    src={previewAvatar || profile?.avatar_url}
                    icon={<UserOutlined />}
                    style={{
                      border: "2px solid",
                      borderColor: currentTheme === "dark" ? "#404040" : "#d9d9d9",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: currentTheme === "dark" ? "#1890ff" : "#1890ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      border: "2px solid",
                      borderColor: currentTheme === "dark" ? "#1f1f1f" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <UploadOutlined />
                  </div>
                </div>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            label="昵称"
            name="nickname"
            rules={[{ max: 20, message: "昵称不能超过20个字符" }]}
            style={{ textAlign: "center" }}
          >
            <Input
              placeholder={profile?.nickname || user?.email?.split("@")[0] || "请输入昵称"}
              maxLength={20}
              style={{ textAlign: "center" }}
              onChange={checkChanges}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Sidebar;

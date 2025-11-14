import { useState, useEffect } from "react";
import { Typography, Table, Avatar, Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import { formatDateTime } from "../utils/dateFormat";

const { Title } = Typography;

const AccountsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

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
      render: (avatarUrl) => (
        <Avatar src={avatarUrl} icon={<UserOutlined />} size={40} />
      ),
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
      render: (createdAt) => formatDateTime(createdAt),
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updatedAt) => formatDateTime(updatedAt),
    },
    {
      title: "最后登录时间",
      dataIndex: "last_sign_in_at",
      key: "last_sign_in_at",
      render: (lastSignInAt) => formatDateTime(lastSignInAt),
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
      children: (
        <div
          style={{ padding: "20px", textAlign: "center", color: "#999" }}
        >
          机器人管理功能开发中...
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>账号管理</Title>
      <Tabs items={tabItems} />
    </div>
  );
};

export default AccountsPage;


import { useState, useEffect } from "react";
import { Typography, Table, Avatar, Tabs, Button } from "antd";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import { formatDateTime } from "../utils/dateFormat";
import AddBotModal from "../components/AddBotModal";

const { Title } = Typography;

const AccountsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bots, setBots] = useState([]);
  const [botsLoading, setBotsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  // 获取机器人列表
  const fetchBots = async () => {
    setBotsLoading(true);
    try {
      const { data, error } = await supabase.from("ai_bots").select("*").order("created_at", { ascending: false });

      if (error) {
        console.error("获取机器人列表失败:", error);
        return;
      }

      setBots(data || []);
    } catch (error) {
      console.error("获取机器人列表异常:", error);
    } finally {
      setBotsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBots();
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

  // 打开新增弹窗
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // 机器人创建成功后的回调
  const handleBotCreated = () => {
    fetchBots();
  };

  // 机器人表格列定义
  const botColumns = [
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
      title: "介绍",
      dataIndex: "description",
      key: "description",
      render: (description) => description || "-",
      ellipsis: true,
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
        <div>
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
              新增机器人
            </Button>
          </div>
          <Table
            columns={botColumns}
            dataSource={bots}
            rowKey="id"
            loading={botsLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>账号管理</Title>
      <Tabs items={tabItems} />
      <AddBotModal open={modalOpen} onCancel={handleCloseModal} onSuccess={handleBotCreated} />
    </div>
  );
};

export default AccountsPage;

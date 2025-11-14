import { useState, useEffect } from "react";
import { Typography, Table, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import { formatDateTime } from "../utils/dateFormat";

const { Title } = Typography;

const MomentsPage = () => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取动态列表
  const fetchMoments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("moments")
        .select("*")
        .order("publish_time", { ascending: false });

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
      render: (avatarUrl) => (
        <Avatar src={avatarUrl} icon={<UserOutlined />} size={40} />
      ),
    },
    {
      title: "发布时间",
      dataIndex: "publish_time",
      key: "publish_time",
      width: 180,
      render: (publishTime) => formatDateTime(publishTime),
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
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              borderRadius: "4px",
            }}
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

export default MomentsPage;


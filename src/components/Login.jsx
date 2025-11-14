import { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        message.error(error.message || "登录失败，请检查邮箱和密码");
        setLoading(false);
        return;
      }

      if (data.user) {
        message.success("登录成功！");
        console.log("xkai-login-success", data.user);
        onLoginSuccess(data.user);
      }
    } catch (error) {
      message.error("登录时发生错误，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-content">
          <div className="login-header">
            <span className="auth-label">Authentication</span>
          </div>
          <div className="login-form-wrapper">
            <h1 className="login-title">登录</h1>
            <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large" className="login-form">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "请输入邮箱地址" },
                  { type: "email", message: "请输入有效的邮箱地址" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Email" className="login-input" />
              </Form.Item>

              <Form.Item name="password" label="Password" rules={[{ required: true, message: "请输入密码" }]}>
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  className="login-input"
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 24 }}>
                <Checkbox className="login-checkbox">记住我</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="login-button" block>
                  登录
                </Button>
              </Form.Item>

              <div className="login-footer">
                <span>
                  还没有账号？
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      message.info("注册功能暂未开放");
                    }}
                  >
                    注册
                  </a>
                </span>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <div className="login-right"></div>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { Form, Input, Button, Checkbox, App } from "antd";
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // 登录处理
  const onLoginFinish = async (values) => {
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
        onLoginSuccess(data.user);
      }
    } catch (error) {
      message.error("登录时发生错误，请稍后重试");
      setLoading(false);
    }
  };

  // 注册处理
  const onRegisterFinish = async (values) => {
    setLoading(true);
    try {
      const { email, password } = values;

      // 注册用户（不操作 profiles 表，因为需要邮箱验证后才能登录）
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        message.error(authError.message || "注册失败，请稍后重试");
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 注册成功后自动登录（如果邮箱验证已关闭）
        if (authData.session) {
          message.success("注册成功！");
          onLoginSuccess(authData.user);
        } else {
          // 如果 Supabase 需要邮箱验证，提示用户
          message.success("注册成功！请检查邮箱并验证账户后登录");
          setIsRegistering(false);
          registerForm.resetFields();
        }
      }
    } catch (error) {
      console.error("注册错误:", error);
      message.error("注册时发生错误，请稍后重试");
    } finally {
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
            <h1 className="login-title">{isRegistering ? "注册" : "登录"}</h1>
            {!isRegistering ? (
              <Form
                form={loginForm}
                name="login"
                onFinish={onLoginFinish}
                layout="vertical"
                size="large"
                className="login-form"
              >
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
                        setIsRegistering(true);
                      }}
                    >
                      点击注册
                    </a>
                  </span>
                </div>
              </Form>
            ) : (
              <Form
                form={registerForm}
                name="register"
                onFinish={onRegisterFinish}
                layout="vertical"
                size="large"
                className="login-form"
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "请输入邮箱地址" },
                    { type: "email", message: "请输入有效的邮箱地址" },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" className="login-input" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "请输入密码" },
                    { min: 6, message: "密码至少需要6个字符" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "请确认密码" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("两次输入的密码不一致"));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="确认密码"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} className="login-button" block>
                    注册
                  </Button>
                </Form.Item>

                <div className="login-footer">
                  <span>
                    已有账号？
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsRegistering(false);
                        registerForm.resetFields();
                      }}
                    >
                      返回登录
                    </a>
                  </span>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
      <div className="login-right"></div>
    </div>
  );
};

export default Login;

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // 如果 profile 不存在（比如新注册的用户），返回 null，让 Sidebar 使用邮箱@前面的字符串
        console.log("用户资料不存在，将使用邮箱作为昵称:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("获取用户资料异常:", error);
      // 出错时也返回 null，让 Sidebar 使用邮箱作为昵称
      setProfile(null);
    }
  };

  // 处理登录成功
  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    await fetchUserProfile(userData);
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("退出登录失败:", error);
        throw error;
      }
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("退出登录异常:", error);
      throw error;
    }
  };

  // 更新用户资料
  const handleProfileUpdate = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  return {
    user,
    profile,
    loading,
    handleLoginSuccess,
    handleLogout,
    handleProfileUpdate,
  };
};

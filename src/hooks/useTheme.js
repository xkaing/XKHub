import { useState, useEffect } from "react";

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("themeMode") || "light";
  });

  // 监听系统主题变化
  useEffect(() => {
    if (themeMode === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
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

  return {
    themeMode,
    setThemeMode,
    getCurrentTheme,
  };
};

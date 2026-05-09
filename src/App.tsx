import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { HomePage } from './pages/HomePage';
import { ImportPage } from './pages/ImportPage';
import { ShopPage } from './pages/ShopPage';
import { SettingsPage } from './pages/SettingsPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { useUserStore } from './store';
import { useThemeStore } from './store';

function App() {
  const checkAndResetDaily = useUserStore((s) => s.checkAndResetDaily);
  const setTheme = useThemeStore((s) => s.setTheme);
  const currentTheme = useThemeStore((s) => s.currentTheme);

  useEffect(() => {
    // 初始化：检查每日重置
    checkAndResetDaily();

    // 应用主题
    const savedTheme = localStorage.getItem('rpg-todo-current-theme');
    if (savedTheme) {
      setTheme(savedTheme as 'medieval' | 'cyberpunk' | 'modern');
    }

    // 应用根元素 data-theme
    document.documentElement.dataset.theme = currentTheme;
  }, [checkAndResetDaily, setTheme, currentTheme]);

  return (
    <BrowserRouter basename="/rpg-todo-app-v2">
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout title="我的冒险任务">
              <HomePage />
            </AppLayout>
          }
        />
        <Route
          path="/import"
          element={
            <AppLayout title="导入任务" showSidebar={false}>
              <ImportPage />
            </AppLayout>
          }
        />
        <Route
          path="/shop"
          element={
            <AppLayout title="兑换商店">
              <ShopPage />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout title="设置">
              <SettingsPage />
            </AppLayout>
          }
        />
        <Route
          path="/ai-analysis"
          element={
            <AppLayout title="AI智能分析">
              <AIAnalysisPage />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

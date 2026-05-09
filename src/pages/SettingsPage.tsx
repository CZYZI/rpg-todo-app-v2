import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { Save, Restore } from '@mui/icons-material';
import { useUserStore } from '../store';
import { useThemeStore } from '../store';
import { STORAGE_KEYS } from '../constants';

export function SettingsPage() {
  const userProfile = useUserStore((s) => s.userProfile);
  const updateUserProfile = useUserStore((s) => s.updateUserProfile);
  
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  
  const [apiKey, setApiKey] = useState(localStorage.getItem(STORAGE_KEYS.QWEN_API_KEY) || '');
  const [saved, setSaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');

  const handleSaveApiKey = () => {
    if (apiKey && !apiKey.startsWith('sk-')) {
      setApiKeyError('API Key 格式不正确，应以 "sk-" 开头');
      return;
    }
    
    localStorage.setItem(STORAGE_KEYS.QWEN_API_KEY, apiKey);
    setApiKeyError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可撤销。')) {
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.AI_INSIGHTS);
      window.location.reload();
    }
  };

  return (
    <Box className="max-w-2xl mx-auto p-4">
      <Typography variant="h4" className="mb-6">
        设置
      </Typography>

      {/* API 配置 */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            AI 配置
          </Typography>
          
          <Box className="mb-4">
            <TextField
              fullWidth
              label="通义千问 API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              error={!!apiKeyError}
              helperText={apiKeyError || '在 https://dashscope.aliyun.com/ 获取'}
              type="password"
              className="mb-2"
            />
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveApiKey}
            >
              保存 API Key
            </Button>
          </Box>

          {saved && (
            <Alert severity="success" className="mb-4">
              API Key 已保存
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 主题设置 */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            主题设置
          </Typography>
          
          <FormControl fullWidth className="mb-4">
            <InputLabel>当前主题</InputLabel>
            <Select
              value={currentTheme}
              onChange={(e) => {
                setTheme(e.target.value as 'medieval' | 'cyberpunk' | 'modern');
                localStorage.setItem('rpg-todo-current-theme', e.target.value);
              }}
            >
              <MenuItem value="medieval">中世纪奇幻</MenuItem>
              <MenuItem value="cyberpunk">赛博朋克</MenuItem>
              <MenuItem value="modern">现代冒险</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* 用户资料 */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            用户资料
          </Typography>
          
          <Box className="mb-2">
            <Typography>当前等级: Lv.{userProfile.level}</Typography>
            <Typography>总积分: {userProfile.totalScore}</Typography>
            <Typography>连续登录: {userProfile.streakDays} 天</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 危险操作 */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4" color="error">
            危险操作
          </Typography>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Restore />}
            onClick={handleClearData}
          >
            清除所有数据
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Analytics,
  PriorityHigh,
  Lightbulb,
  TrendingUp,
} from '@mui/icons-material';
import { useTaskStore } from '../store';
import { useUserStore } from '../store';
import { useQwenAPI } from '../hooks/useQwenAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AIAnalysisPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const userProfile = useUserStore((s) => s.userProfile);
  
  const {
    analyzeTaskPatterns,
    generateDailyPlan,
    loading,
    error,
  } = useQwenAPI();
  
  const [patterns, setPatterns] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dailyPlan, setDailyPlan] = useState<{ selected: number[]; plan: string } | null>(null);
  const [availableTime, setAvailableTime] = useState(120); // 默认2小时

  const completedTasks = tasks.filter((t) => t.status === 'completed');

  useEffect(() => {
    // 加载时已完成的任务进行模式分析
    if (completedTasks.length >= 3) {
      handlePatternAnalysis();
    }
  }, []);

  const handlePatternAnalysis = async () => {
    if (completedTasks.length < 3) {
      alert('需要至少3个已完成任务才能进行分析');
      return;
    }

    try {
      const result = await analyzeTaskPatterns(
        completedTasks.map((t) => ({
          name: t.originalName,
          difficulty: t.difficulty,
          duration: t.duration,
          completedAt: t.completedAt!,
        }))
      );
      setPatterns(result.patterns);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error('模式分析失败:', err);
    }
  };

  const handleGenerateDailyPlan = async () => {
    const pendingTasks = tasks.filter((t) => t.status === 'pending');
    if (pendingTasks.length === 0) {
      alert('没有待完成任务');
      return;
    }

    try {
      const result = await generateDailyPlan(
        pendingTasks.map((t) => ({ name: t.originalName, difficulty: t.difficulty, duration: t.duration })),
        availableTime,
        userProfile.taskStats.favoriteTags[0] || 'modern'
      );
      setDailyPlan(result);
    } catch (err) {
      console.error('每日计划生成失败:', err);
    }
  };

  // 准备图表数据
  const weeklyData = userProfile.taskStats.weeklyStats.slice(-4).map((w) => ({
    周次: w.week,
    完成数: w.completed,
    积分: w.score,
  }));

  return (
    <Box className="max-w-4xl mx-auto p-4">
      <Typography variant="h4" className="mb-6">
        <Analytics className="mr-2" />
        AI智能分析
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                <PriorityHigh className="mr-1" />
                总完成任务
              </Typography>
              <Typography variant="h3">{userProfile.taskStats.totalCompleted}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="secondary">
                <TrendingUp className="mr-1" />
                完成率
              </Typography>
              <Typography variant="h3">{(userProfile.taskStats.completionRate * 100).toFixed(1)}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success">
                <Lightbulb className="mr-1" />
                平均积分
              </Typography>
              <Typography variant="h3">{userProfile.taskStats.averageScore.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 每周统计图表 */}
      {weeklyData.length > 0 && (
        <Paper className="p-4 mb-6">
          <Typography variant="h6" className="mb-4">
            每周完成趋势
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="周次" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="完成数" fill="#8884d8" />
              <Bar dataKey="积分" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* AI模式分析 */}
      <Paper className="p-4 mb-6">
        <Typography variant="h6" className="mb-4">
          <Analytics className="mr-2" />
          AI任务完成模式分析
        </Typography>
        
        <Button
          variant="contained"
          onClick={handlePatternAnalysis}
          disabled={loading || completedTasks.length < 3}
          className="mb-4"
        >
          开始分析
        </Button>

        {patterns.length > 0 && (
          <Box className="mb-4">
            <Typography variant="subtitle1" className="mb-2">发现模式：</Typography>
            <List>
              {patterns.map((pattern, i) => (
                <ListItem key={i}>
                  <ListItemText primary={`- ${pattern}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {suggestions.length > 0 && (
          <Box>
            <Typography variant="subtitle1" className="mb-2">改进建议：</Typography>
            <List>
              {suggestions.map((suggestion, i) => (
                <ListItem key={i}>
                  <ListItemText primary={`- ${suggestion}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {completedTasks.length < 3 && (
          <Alert severity="info">
            需要至少完成3个任务才能进行AI模式分析
          </Alert>
        )}
      </Paper>

      {/* AI每日计划生成 */}
      <Paper className="p-4 mb-6">
        <Typography variant="h6" className="mb-4">
          <Lightbulb className="mr-2" />
          AI每日计划生成
        </Typography>
        
        <Box className="mb-4">
          <Typography>可用时间（分钟）：</Typography>
          <input
            type="number"
            value={availableTime}
            onChange={(e) => setAvailableTime(parseInt(e.target.value) || 120)}
            className="border p-2 rounded"
            min={30}
            max={480}
          />
        </Box>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleGenerateDailyPlan}
          disabled={loading || tasks.filter((t) => t.status === 'pending').length === 0}
          className="mb-4"
        >
          生成今日计划
        </Button>

        {dailyPlan && (
          <Alert severity="success">
            <Typography variant="subtitle1">AI生成的计划：</Typography>
            <Typography>{dailyPlan.plan}</Typography>
            <Typography variant="body2" className="mt-2">
              推荐任务编号：{dailyPlan.selected.join(', ')}
            </Typography>
          </Alert>
        )}
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <CircularProgress className="mt-4" />}
    </Box>
  );
}

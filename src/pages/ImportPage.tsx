import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../store';
import { useQwenAPI } from '../hooks/useQwenAPI';
import { WorldviewSelector } from '../components/rpg/WorldviewSelector';
import { TaskImport } from '../components/task/TaskImport';
import { TaskDifficulty, Worldview } from '../types';
import { getTimeOfDay, TIME_OF_DAY_LABELS, TimeOfDay } from '../utils/timeOfDay';
import { DIFFICULTY_MULTIPLIER } from '../types';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

export function ImportPage() {
  const navigate = useNavigate();
  const addTasks = useTaskStore((s) => s.addTasks);
  const getRecentDescriptions = useTaskStore((s) => s.getRecentDescriptions);
  const { generateTaskDescription, loading, error, generatePrioritySuggestions, generateTaskDecomposition } = useQwenAPI();

  const [worldview, setWorldview] = useState<Worldview>('medieval');
  const [defaultDuration, setDefaultDuration] = useState(30);
  const [defaultDifficulty, setDefaultDifficulty] = useState<TaskDifficulty>('normal');
  const [showPriority, setShowPriority] = useState(false);
  const [priorityResult, setPriorityResult] = useState<{ order: number[]; reasons: string[] } | null>(null);

  const currentTimeOfDay = getTimeOfDay();

  const handleImport = async (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length === 0) return;

    // 获取历史描述用于防重复
    const historyDescriptions = getRecentDescriptions(20);

    const partialTasks = lines.map((line) => ({
      originalName: line.trim(),
      rpgDescription: '',
      worldview,
      duration: defaultDuration,
      difficulty: defaultDifficulty,
    }));

    // 尝试用 AI 生成 RPG 描述
    const tasksWithDescription = await Promise.all(
      partialTasks.map(async (task) => {
        try {
          const description = await generateTaskDescription({
            taskName: task.originalName,
            worldview,
            historyDescriptions,
            difficulty: task.difficulty,
            timeOfDay: currentTimeOfDay,
            score: Math.round(task.duration * (DIFFICULTY_MULTIPLIER[task.difficulty] || 1.0)),
          });
          return { ...task, rpgDescription: description };
        } catch {
          // AI 失败时使用降级方案
          const score = Math.round(task.duration * (DIFFICULTY_MULTIPLIER[task.difficulty] || 1.0));
          return {
            ...task,
            rpgDescription: `${task.originalName}，奖励${score}积分`,
          };
        }
      })
    );

    addTasks(tasksWithDescription);
    navigate('/');
  };

  const handlePriorityAnalysis = async () => {
    const tasks = useTaskStore.getState().tasks.filter((t) => t.status === 'pending');
    if (tasks.length === 0) return;

    try {
      const result = await generatePrioritySuggestions(
        tasks.map((t) => ({ name: t.originalName, difficulty: t.difficulty, duration: t.duration }))
      );
      setPriorityResult(result);
      setShowPriority(true);
    } catch (err) {
      console.error('优先级分析失败:', err);
    }
  };

  const handleTaskDecomposition = async (taskName: string, difficulty: string) => {
    try {
      const subtasks = await generateTaskDecomposition(taskName, difficulty);
      alert(`AI建议的子任务:\n${subtasks.join('\n')}`);
    } catch (err) {
      console.error('任务分解失败:', err);
    }
  };

  return (
    <Box className="max-w-2xl mx-auto p-4">
      <Typography variant="h4" className="mb-4">
        导入待办任务
      </Typography>

      <WorldviewSelector value={worldview} onChange={setWorldview} />

      <Box className="mb-4">
        <Typography>默认耗时（分钟）：</Typography>
        <TextField
          type="number"
          value={defaultDuration}
          onChange={(e) => setDefaultDuration(Math.max(5, parseInt(e.target.value) || 5))}
          inputProps={{ min: 5 }}
          className="border p-2 rounded"
        />
      </Box>

      <Box className="mb-4">
        <Typography>默认难度：</Typography>
        <Select
          value={defaultDifficulty}
          onChange={(e) => setDefaultDifficulty(e.target.value as TaskDifficulty)}
        >
          <MenuItem value="easy">简单 (×1.0)</MenuItem>
          <MenuItem value="normal">普通 (×1.5)</MenuItem>
          <MenuItem value="hard">困难 (×2.0)</MenuItem>
          <MenuItem value="epic">史诗 (×3.0)</MenuItem>
        </Select>
      </Box>

      <Box className="mb-4 text-sm text-gray-500">
        当前时段：{TIME_OF_DAY_LABELS[currentTimeOfDay]} — AI 将根据时段调整任务氛围
      </Box>

      {/* AI功能按钮 */}
      <Box className="mb-4">
        <Button
          variant="contained"
          color="secondary"
          onClick={handlePriorityAnalysis}
          disabled={loading}
          className="mr-2"
        >
          AI优先级推荐
        </Button>
      </Box>

      {/* 优先级结果展示 */}
      {showPriority && priorityResult && (
        <Alert severity="info" className="mb-4">
          <Typography variant="subtitle1">AI优先级建议：</Typography>
          {priorityResult.order.map((taskIndex, i) => (
            <Box key={taskIndex} className="ml-4">
              {i + 1}. 任务{taskIndex}: {priorityResult.reasons[i]}
            </Box>
          ))}
        </Alert>
      )}

      <TaskImport onImport={handleImport} loading={loading} />

      {error && <Alert severity="error" className="mt-2">{error}</Alert>}
      {loading && <CircularProgress className="mt-4" />}
    </Box>
  );
}

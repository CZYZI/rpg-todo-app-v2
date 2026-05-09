import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  CheckCircle,
  Delete,
  Add,
  Edit,
  ExpandMore,
  ExpandLess,
  CheckBox,
  CheckBoxOutlineBlank,
} from '@mui/icons-material';
import { useTaskStore } from '../store';
import { useUserStore } from '../store';
import { Task, TaskStatus, TaskDifficulty } from '../types';
import { DIFFICULTY_MULTIPLIER } from '../types';

export function HomePage() {
  const tasks = useTaskStore((s) => s.tasks);
  const completeTask = useTaskStore((s) => s.completeTask);
  const removeTask = useTaskStore((s) => s.removeTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const addTagToTask = useTaskStore((s) => s.addTagToTask);
  const removeTagFromTask = useTaskStore((s) => s.removeTagFromTask);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const removeSubtask = useTaskStore((s) => s.removeSubtask);
  
  const userProfile = useUserStore((s) => s.userProfile);
  const addScore = useUserStore((s) => s.addScore);
  const updateTaskStats = useUserStore((s) => s.updateTaskStats);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [subtaskDialogOpen, setSubtaskDialogOpen] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleComplete = (task: Task) => {
    const score = completeTask(task.id);
    if (score > 0) {
      addScore(score);
    }
    updateTaskStats(tasks);
  };

  const handleAddTag = () => {
    if (selectedTask && newTag.trim()) {
      addTagToTask(selectedTask.id, newTag.trim());
      setNewTag('');
      setTagDialogOpen(false);
    }
  };

  const handleAddSubtask = () => {
    if (selectedTask && newSubtaskName.trim()) {
      addSubtask(selectedTask.id, newSubtaskName.trim());
      setNewSubtaskName('');
      setSubtaskDialogOpen(false);
    }
  };

  const getDifficultyColor = (difficulty: TaskDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'normal':
        return 'primary';
      case 'hard':
        return 'warning';
      case 'epic':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        我的冒险任务
      </Typography>

      {/* 用户信息 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">冒险者等级: Lv.{userProfile.level}</Typography>
        <LinearProgress
          variant="determinate"
          value={userProfile.levelProgress * 100}
          sx={{ mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          总积分: {userProfile.totalScore} | 今日积分: {userProfile.todayScore} | 连续登录: {userProfile.streakDays}天
        </Typography>
      </Paper>

      {/* 待完成任务 */}
      <Typography variant="h5" gutterBottom>
        待完成任务 ({pendingTasks.length})
      </Typography>
      <List>
        {pendingTasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1, flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <ListItemIcon>
                <IconButton onClick={() => handleComplete(task)}>
                  <CheckBoxOutlineBlank />
                </IconButton>
              </ListItemIcon>
              <ListItemText
                primary={task.rpgDescription || task.originalName}
                secondary={
                  <span>
                    <Chip label={task.difficulty} size="small" color={getDifficultyColor(task.difficulty)} sx={{ mr: 1 }} />
                    <Chip label={`${task.duration}分钟`} size="small" sx={{ mr: 1 }} />
                    <Chip label={`${task.totalScore}积分`} size="small" color="secondary" />
                    {task.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" sx={{ ml: 0.5 }} />
                    ))}
                  </span>
                }
              />
              <IconButton onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                {expandedTask === task.id ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <IconButton onClick={() => { setSelectedTask(task); setTagDialogOpen(true); }}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => removeTask(task.id)}>
                <Delete />
              </IconButton>
            </Box>
            
            {/* 展开区域：子任务 */}
            {expandedTask === task.id && (
              <Box sx={{ width: '100%', pl: 4, pt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  子任务:
                </Typography>
                {task.subtasks.map((st) => (
                  <Box key={st.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <IconButton size="small" onClick={() => toggleSubtask(task.id, st.id)}>
                      {st.completed ? <CheckBox /> : <CheckBoxOutlineBlank />}
                    </IconButton>
                    <Typography variant="body2" sx={{ textDecoration: st.completed ? 'line-through' : 'none' }}>
                      {st.name}
                    </Typography>
                    <IconButton size="small" onClick={() => removeSubtask(task.id, st.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={() => { setSelectedTask(task); setSubtaskDialogOpen(true); }}>
                  <Add /> 添加子任务
                </Button>
              </Box>
            )}
          </ListItem>
        ))}
      </List>

      {/* 已完成任务 */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        已完成任务 ({completedTasks.length})
      </Typography>
      <List>
        {completedTasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1, opacity: 0.7 }}
          >
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary={task.rpgDescription || task.originalName}
              secondary={
                <span>
                  <Chip label={task.difficulty} size="small" color={getDifficultyColor(task.difficulty)} sx={{ mr: 1 }} />
                  <Chip label={`${task.duration}分钟`} size="small" />
                </span>
              }
            />
            <IconButton onClick={() => removeTask(task.id)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* 添加标签对话框 */}
      <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)}>
        <DialogTitle>添加标签到任务</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="标签名称"
            fullWidth
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialogOpen(false)}>取消</Button>
          <Button onClick={handleAddTag}>添加</Button>
        </DialogActions>
      </Dialog>

      {/* 添加子任务对话框 */}
      <Dialog open={subtaskDialogOpen} onClose={() => setSubtaskDialogOpen(false)}>
        <DialogTitle>添加子任务</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="子任务名称"
            fullWidth
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubtaskDialogOpen(false)}>取消</Button>
          <Button onClick={handleAddSubtask}>添加</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getStorage } from '../utils/storage';
import { calculateBaseScore, checkDailyLimit } from '../utils/score';

interface TaskStore {
  tasks: Task[];
  addTasks: (tasks: Omit<Task, 'id' | 'status' | 'createdAt' | 'completedAt' | 'baseScore' | 'bonusScore' | 'totalScore' | 'tags' | 'subtasks'>[]) => void;
  completeTask: (id: string) => number; // 返回实际获得的积分
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  getRecentDescriptions: (limit?: number) => string[];
  addTagToTask: (id: string, tag: string) => void;
  removeTagFromTask: (id: string, tag: string) => void;
  addSubtask: (taskId: string, subtaskName: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTasks: (partialTasks) => {
        const newTasks: Task[] = partialTasks.map((pt) => {
          const baseScore = calculateBaseScore({ duration: pt.duration, difficulty: pt.difficulty });
          return {
            ...pt,
            id: crypto.randomUUID(),
            status: 'pending' as TaskStatus,
            createdAt: new Date().toISOString(),
            completedAt: null,
            tags: [],
            subtasks: [],
            baseScore,
            bonusScore: 0,
            totalScore: baseScore,
          };
        });
        set((state) => ({ tasks: [...state.tasks, ...newTasks] }));
      },
      completeTask: (id) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task || task.status === 'completed') return 0;
        
        // 获取今日已获积分
        const userProfile = getStorage<{ todayScore: number }>(STORAGE_KEYS.USER_PROFILE, { todayScore: 0 } as never);
        const todayScore = userProfile?.todayScore || 0;
        
        // 计算实际可获得积分（受每日上限限制）
        const actualScore = checkDailyLimit(task.totalScore, todayScore);
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'completed' as TaskStatus, completedAt: new Date().toISOString() }
              : t
          ),
        }));
        
        return actualScore;
      },
      removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),
      getRecentDescriptions: (limit = 20) => {
        const state = get();
        return state.tasks
          .filter((t) => t.rpgDescription && t.rpgDescription.length > 0)
          .slice(-limit)
          .map((t) => t.rpgDescription);
      },
      addTagToTask: (id, tag) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, tags: [...t.tags, tag] } : t
        ),
      })),
      removeTagFromTask: (id, tag) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, tags: t.tags.filter((t) => t !== tag) } : t
        ),
      })),
      addSubtask: (taskId, subtaskName) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: [
                  ...t.subtasks,
                  { id: crypto.randomUUID(), name: subtaskName, completed: false },
                ],
              }
            : t
        ),
      })),
      toggleSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((st) =>
                  st.id === subtaskId ? { ...st, completed: !st.completed } : st
                ),
              }
            : t
        ),
      })),
      removeSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
            : t
        ),
      })),
    }),
    {
      name: STORAGE_KEYS.TASKS,
    }
  )
);

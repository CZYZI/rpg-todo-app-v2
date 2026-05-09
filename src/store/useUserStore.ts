import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, Task, AIInsight } from '../types';
import { STORAGE_KEYS } from '../constants';
import { calculateLevelProgress } from '../utils/score';

interface UserStore {
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  checkAndResetDaily: () => void;
  addScore: (score: number) => void;
  getAIInsights: () => AIInsight[];
  addAIInsight: (insight: Omit<AIInsight, 'id' | 'createdAt' | 'applied'>) => void;
  markInsightApplied: (id: string) => void;
  updateTaskStats: (tasks: Task[]) => void;
}

const defaultUserProfile: UserProfile = {
  totalScore: 0,
  level: 1,
  levelProgress: 0,
  ownedSkins: [],
  activeSkinId: null,
  streakDays: 0,
  lastLoginDate: '',
  todayScore: 0,
  todayDate: '',
  claimedDailyBonus: false,
  doubleScoreExpiresAt: null,
  taskStats: {
    totalCompleted: 0,
    totalTimeSpent: 0,
    favoriteTags: [],
    completionRate: 0,
    averageScore: 0,
    weeklyStats: [],
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userProfile: { ...defaultUserProfile },
      updateUserProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates },
      })),
      checkAndResetDaily: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (state.userProfile.todayDate !== today) {
          // 重置每日数据
          set((state) => ({
            userProfile: {
              ...state.userProfile,
              todayScore: 0,
              todayDate: today,
              claimedDailyBonus: false,
            },
          }));
        }
        
        // 检查连续天数
        const lastLogin = new Date(state.userProfile.lastLoginDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // 连续登录
          set((state) => ({
            userProfile: {
              ...state.userProfile,
              streakDays: state.userProfile.streakDays + 1,
              lastLoginDate: today,
            },
          }));
        } else if (diffDays > 1) {
          // 中断
          set((state) => ({
            userProfile: {
              ...state.userProfile,
              streakDays: 0,
              lastLoginDate: today,
            },
          }));
        } else if (state.userProfile.lastLoginDate === '') {
          // 首次登录
          set((state) => ({
            userProfile: {
              ...state.userProfile,
              lastLoginDate: today,
            },
          }));
        }
      },
      addScore: (score) => set((state) => {
        const newTotal = state.userProfile.totalScore + score;
        const newTodayScore = state.userProfile.todayScore + score;
        const levelInfo = calculateLevelProgress(newTotal);
        
        return {
          userProfile: {
            ...state.userProfile,
            totalScore: newTotal,
            todayScore: newTodayScore,
            level: levelInfo.level,
            levelProgress: levelInfo.progress,
          },
        };
      }),
      getAIInsights: () => {
        const insights = localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS);
        return insights ? JSON.parse(insights) : [];
      },
      addAIInsight: (insight) => {
        const insights = get().getAIInsights();
        const newInsight: AIInsight = {
          ...insight,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          applied: false,
        };
        insights.push(newInsight);
        localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));
      },
      markInsightApplied: (id) => {
        const insights = get().getAIInsights();
        const updated = insights.map((i) => (i.id === id ? { ...i, applied: true } : i));
        localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(updated));
      },
      updateTaskStats: (tasks) => {
        const completed = tasks.filter((t) => t.status === 'completed');
        const totalCompleted = completed.length;
        const totalTimeSpent = completed.reduce((sum, t) => sum + t.duration, 0);
        
        // 计算最爱标签
        const tagCounts: Record<string, number> = {};
        completed.forEach((t) => {
          t.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        const favoriteTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag]) => tag);
        
        // 计算完成率
        const completionRate = tasks.length > 0 ? totalCompleted / tasks.length : 0;
        
        // 计算平均积分
        const averageScore = totalCompleted > 0
          ? completed.reduce((sum, t) => sum + t.totalScore, 0) / totalCompleted
          : 0;
        
        // 更新每周统计（简化版）
        const week = getWeekNumber(new Date());
        const weeklyStats = state.userProfile.taskStats.weeklyStats.filter((w) => w.week !== week);
        weeklyStats.push({
          week,
          completed: completed.filter((t) => isThisWeek(t.completedAt)).length,
          score: completed.filter((t) => isThisWeek(t.completedAt)).reduce((sum, t) => sum + t.totalScore, 0),
        });
        
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            taskStats: {
              totalCompleted,
              totalTimeSpent,
              favoriteTags,
              completionRate,
              averageScore,
              weeklyStats,
            },
          },
        }));
      },
    }),    {
      name: STORAGE_KEYS.USER_PROFILE,
    }
  )
);

// 辅助函数
function getWeekNumber(date: Date): string {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return `${date.getFullYear()}-W${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
}

function isThisWeek(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const week = getWeekNumber(now);
  const dateWeek = getWeekNumber(date);
  return week === dateWeek;
}

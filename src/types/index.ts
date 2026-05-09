/** 世界观类型 */
export type Worldview = 'medieval' | 'cyberpunk' | 'modern';

/** 世界观标签映射 */
export const WORLDVIEW_LABELS: Record<Worldview, string> = {
  medieval: '中世纪奇幻',
  cyberpunk: '赛博朋克',
  modern: '现代冒险',
};

/** 任务难度 */
export type TaskDifficulty = 'easy' | 'normal' | 'hard' | 'epic';

/** 难度系数映射 */
export const DIFFICULTY_MULTIPLIER: Record<TaskDifficulty, number> = {
  easy: 1.0,
  normal: 1.5,
  hard: 2.0,
  epic: 3.0,
};

/** 任务状态 */
export type TaskStatus = 'pending' | 'completed';

/** 任务数据结构 */
export interface Task {
  id: string;
  originalName: string;
  rpgDescription: string;
  worldview: Worldview;
  duration: number;
  difficulty: TaskDifficulty;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
  tags: string[];
  subtasks: SubTask[];
}

/** 子任务 */
export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

/** 用户档案数据结构 */
export interface UserProfile {
  totalScore: number;
  level: number;
  levelProgress: number;
  ownedSkins: string[];
  activeSkinId: string | null;
  streakDays: number;
  lastLoginDate: string;
  todayScore: number;
  todayDate: string;
  claimedDailyBonus: boolean;
  doubleScoreExpiresAt: string | null;
  taskStats: TaskStats;
}

/** 任务统计 */
export interface TaskStats {
  totalCompleted: number;
  totalTimeSpent: number;
  favoriteTags: string[];
  completionRate: number;
  averageScore: number;
  weeklyStats: WeeklyStat[];
}

/** 每周统计 */
export interface WeeklyStat {
  week: string;
  completed: number;
  score: number;
}

/** 主题皮肤数据结构 */
export interface ThemeSkin {
  id: string;
  name: string;
  description: string;
  cost: number;
  worldview: Worldview;
  previewImage: string;
  cssVars: Record<string, string>;
  isCharacterSkin?: boolean;
}

/** 商店物品 */
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'theme_skin' | 'character_skin' | 'double_score_card' | 'ai_insight';
  icon: string;
  available: boolean;
}

/** AI洞察报告 */
export interface AIInsight {
  id: string;
  type: 'priority' | 'decomposition' | 'plan' | 'pattern';
  title: string;
  content: string;
  createdAt: string;
  applied: boolean;
}

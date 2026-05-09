import { TaskDifficulty } from '../types';

/**
 * 计算基础积分
 * @param params 计算参数
 * @returns 基础积分
 */
export function calculateBaseScore(params: {
  duration: number;
  difficulty: TaskDifficulty;
}): number {
  const { duration, difficulty } = params;
  
  // 基础积分 = 时长(分钟) × 难度系数
  const difficultyMultiplier = getDifficultyMultiplier(difficulty);
  const baseScore = Math.round(duration * difficultyMultiplier);
  
  return baseScore;
}

/**
 * 获取难度系数
 * @param difficulty 难度
 * @returns 难度系数
 */
function getDifficultyMultiplier(difficulty: TaskDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 1.0;
    case 'normal':
      return 1.5;
    case 'hard':
      return 2.0;
    case 'epic':
      return 3.0;
    default:
      return 1.0;
  }
}

/**
 * 检查每日积分上限
 * @param taskScore 任务积分
 * @param todayScore 今日已获积分
 * @returns 实际可获得积分
 */
export function checkDailyLimit(taskScore: number, todayScore: number): number {
  const DAILY_LIMIT = 200;
  const remaining = DAILY_LIMIT - todayScore;
  
  if (remaining <= 0) return 0;
  return Math.min(taskScore, remaining);
}

/**
 * 计算等级进度
 * @param totalScore 总积分
 * @returns 等级和进度
 */
export function calculateLevelProgress(totalScore: number): {
  level: number;
  progress: number;
  nextLevelScore: number;
} {
  const LEVEL_BASE = 100;
  const LEVEL_FACTOR = 1.5;
  
  let level = 1;
  let accumulatedScore = 0;
  let nextLevelScore = LEVEL_BASE;
  
  while (totalScore >= accumulatedScore + nextLevelScore) {
    accumulatedScore += nextLevelScore;
    level++;
    nextLevelScore = Math.round(LEVEL_BASE * Math.pow(LEVEL_FACTOR, level - 1));
  }
  
  const progress = (totalScore - accumulatedScore) / nextLevelScore;
  
  return {
    level,
    progress,
    nextLevelScore: accumulatedScore + nextLevelScore,
  };
}

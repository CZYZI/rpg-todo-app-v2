/** 时间段类型 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

/** 时间段中文标签 */
export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: '早晨',
  afternoon: '下午',
  evening: '夜晚',
};

/**
 * 根据当前系统时间获取时间段
 * morning:    6:00 - 11:59
 * afternoon: 12:00 - 17:59
 * evening:   18:00 - 5:59
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 17) return 'afternoon';
  return 'evening';
}

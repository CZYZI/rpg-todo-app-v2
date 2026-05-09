import { TaskDifficulty } from '../types';
import { TimeOfDay } from '../utils/timeOfDay';

/** 世界观详细描述（用于 prompt） */
const WORLDVIEW_GUIDES: Record<string, string> = {
  medival: '中世纪奇幻世界（骑士、巨龙、魔法、城堡、精灵、矮人、魔物、圣殿、遗迹）',
  cyberpunk: '赛博朋克世界（黑客、机械义体、霓虹灯、暗网、AI、巨型财阀、飞行器、虚拟空间）',
  modern: '现代冒险世界（特工、秘密组织、未知遗迹、高科技装备、全球任务、隐藏关卡）',
};

/** 难度风格描述 */
const DIFFICULTY_GUIDES: Record<TaskDifficulty, string> = {
  easy: '简单级别——日常小事，使用轻松的动词如"前往、收集、准备、整理"',
  normal: '普通级别——需要付出一定努力，使用行动感动词如"探索、狩猎、突破、调查"',
  hard: '困难级别——充满挑战与危险，使用强烈动词如"征服、讨伐、潜入、破解"',
  epic: '史诗级别——改变世界的壮举，使用史诗动词如"封印、拯救、终结、毁灭、觉醒"',
};

/** 时间段氛围描述 */
const TIME_OF_DAY_GUIDES: Record<TimeOfDay, string> = {
  morning: '清晨氛围——清新、希望、启程、初升的阳光',
  afternoon: '午后氛围——紧张、行动、冒险、炽热的战斗',
  evening: '夜晚氛围——黑暗、危机、决战、月光下的秘密',
};

/**
 * 构建 Prompt 参数
 */
export interface BuildTaskPromptParams {
  taskName: string;
  worldview: string;
  difficulty: TaskDifficulty;
  timeOfDay: TimeOfDay;
  historyDescriptions: string[];
}

/**
 * 改进后的 Prompt 构建（任务描述生成）
 */
export function buildTaskPrompt(params: BuildTaskPromptParams): string {
  const { taskName, worldview, difficulty, timeOfDay, historyDescriptions } = params;

  const worldviewGuide = WORLDVIEW_GUIDES[worldview] || WORLDVIEW_GUIDES.modern;
  const difficultyGuide = DIFFICULTY_GUIDES[difficulty] || DIFFICULTY_GUIDES.normal;
  const timeGuide = TIME_OF_DAY_GUIDES[timeOfDay] || TIME_OF_DAY_GUIDES.afternoon;

  let prompt = `你是一个RPG任务生成器，擅长将现实待办转化为沉浸式任务描述。

【任务信息】
- 待办事项：${taskName}
- 世界观：${worldviewGuide}
- 难度：${difficultyGuide}
- 时间氛围：${timeGuide}

【生成规则】
1. 先理解待办的真实含义（如"吃饭"="获取食物并进食"，"开会"="多人协作讨论决策"）
2. 基于理解的含义 + 世界观 + 难度 + 时间氛围，生成RPG任务描述
3. 描述20字以内，包含强化动词和世界观元素
4. 输出格式：'任务描述，奖励X积分'（X为占位符）`;

  if (historyDescriptions.length > 0) {
    prompt += `\n\n【防重复】以下描述已使用过，请使用不同的怪物/地点/动词/场景：\n${historyDescriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;
  }

  return prompt;
}

/**
 * 构建 AI 任务优先级推荐 Prompt
 */
export function buildPriorityPrompt(tasks: Array<{ name: string; difficulty: string; duration: number }>): string {
  const taskList = tasks.map((t, i) => `${i + 1}. ${t.name} (难度: ${t.difficulty}, 预计: ${t.duration}分钟)`).join('\n');
  
  return `你是一个任务优先级分析专家。请分析以下待办任务，给出合理的执行顺序建议。

【任务列表】
${taskList}

【分析要求】
1. 考虑任务难度、耗时、紧急程度
2. 给出最优执行顺序（编号列表）
3. 说明推荐理由（每条任务一句话）
4. 输出JSON格式：{"order": [1,2,3...], "reasons": ["原因1", "原因2"...]}`;
}

/**
 * 构建 AI 任务分解 Prompt
 */
export function buildDecompositionPrompt(taskName: string, difficulty: string): string {
  return `你是一个任务分解专家。请将以下任务分解为3-5个可执行的子任务。

【任务】${taskName}
【难度】${difficulty}

【分解要求】
1. 将任务分解为具体的、可执行的子步骤
2. 每个子步骤应该清晰明确
3. 输出JSON格式：{"subtasks": ["步骤1", "步骤2", "步骤3"...]}`;
}

/**
 * 构建 AI 每日计划生成 Prompt
 */
export function buildDailyPlanPrompt(
  tasks: Array<{ name: string; difficulty: string; duration: number }>,
  availableTime: number,
  worldview: string
): string {
  const taskList = tasks.map((t, i) => `${i + 1}. ${t.name} (难度: ${t.difficulty}, 预计: ${t.duration}分钟)`).join('\n');
  const worldviewGuide = WORLDVIEW_GUIDES[worldview] || '';
  
  return `你是一个智能日程规划师。请根据可用时间，从任务列表中选择合适的任务制定今日计划。

【可用时间】${availableTime}分钟
【世界观】${worldviewGuide}

【任务列表】
${taskList}

【计划要求】
1. 选择总时长不超过可用时间的任务组合
2. 考虑任务难度搭配（难易结合）
3. 生成有趣的RPG风格计划描述
4. 输出JSON格式：{"selected": [1,2,3...], "plan": "计划描述"}`;
}

/**
 * 构建 AI 任务完成模式分析 Prompt
 */
export function buildPatternAnalysisPrompt(completedTasks: Array<{ name: string; difficulty: string; duration: number; completedAt: string }>): string {
  const taskList = completedTasks.map((t, i) => `${i + 1}. ${t.name} (难度: ${t.difficulty}, 时长: ${t.duration}分钟, 完成于: ${t.completedAt})`).join('\n');
  
  return `你是一个行为模式分析专家。请分析以下已完成的任务，发现用户的任务完成模式。

【已完成任务】
${taskList}

【分析要求】
1. 分析完成任务的时间分布规律
2. 分析偏好的任务难度类型
3. 分析任务完成效率
4. 给出改进建议
5. 输出JSON格式：{"patterns": ["模式1", "模式2"...], "suggestions": ["建议1", "建议2"...]}`;
}

/** 系统 Prompt */
export const QWEN_SYSTEM_PROMPT = '你是一个RPG任务助手，擅长将现实待办转化为沉浸式体验，并能进行智能任务管理。';

/**
 * 降级方案：按世界观 + 关键词匹配生成描述
 */
export const FALLBACK_DESCRIPTIONS: Record<string, string[]> = {
  medieval: [
    '前往遗迹探索，奖励{X}积分',
    '击败深渊巨龙，奖励{X}积分',
    '净化被诅咒的村庄，奖励{X}积分',
  ],
  cyberpunk: [
    '潜入暗网禁区，奖励{X}积分',
    '操控机械臂，奖励{X}积分',
    '破解加密协议，奖励{X}积分',
  ],
  modern: [
    '探索未知区域，奖励{X}积分',
    '完成秘密任务，奖励{X}积分',
    '解锁隐藏关卡，奖励{X}积分',
  ],
};

/**
 * 待办关键词 → 世界观降级模板
 */
const TASK_KEYWORD_TEMPLATES: Record<string, Record<string, string[]>> = {
  // 饮食相关
  '吃|饭|餐|食|喝|奶茶|咖啡|零食': {
    medieval: ['狩猎魔物，采集精灵果实烹饪盛宴，奖励{X}积分', '前往酒馆，品尝传说中龙血酿的蜜酒，奖励{X}积分'],
    cyberpunk: ['潜入营养舱，合成高品质蛋白块，奖励{X}积分', '黑入自动售货机，获取限量版能量饮料，奖励{X}积分'],
    modern: ['深入前线补给站，获取特供能量餐，奖励{X}积分', '前往秘密餐厅，完成美食鉴赏任务，奖励{X}积分'],
  },
  // 运动/健身
  '运动|健身|跑步|锻炼|游泳|打球': {
    medival: ['前往竞技场，完成骑士体能试炼，奖励{X}积分', '攀登龙脊山脉，磨炼战士体魄，奖励{X}积分'],
    cyberpunk: ['启动神经链路，完成义体体能校准，奖励{X}积分', '穿越霓虹街区，参加地下跑酷竞赛，奖励{X}积分'],
    modern: ['前往秘密训练基地，完成特工体能考核，奖励{X}积分', '攀登未知山峰，完成极限挑战，奖励{X}积分'],
  },
  // 学习/工作
  '学习|看书|阅读|复习|写作业|论文': {
    medieval: ['进入大法师图书馆，研读失传魔法典籍，奖励{X}积分', '拜访贤者之塔，领悟古老符文知识，奖励{X}积分'],
    cyberpunk: ['接入知识矩阵，下载禁忌数据碎片，奖励{X}积分', '潜入废弃AI核心，破解远古代码，奖励{X}积分'],
    modern: ['前往秘密档案馆，查阅尘封的情报文件，奖励{X}积分', '破译加密通讯，获取关键情报线索，奖励{X}积分'],
  },
};

/**
 * 智能降级方案：根据待办关键词匹配更贴合的模板
 */
export function getSmartFallbackDescription(
  worldview: string,
  taskName: string,
  score: number
): string {
  // 尝试匹配关键词模板
  for (const [keywords, worldTemplates] of Object.entries(TASK_KEYWORD_TEMPLATES)) {
    const regex = new RegExp(keywords);
    if (regex.test(taskName)) {
      const templates = worldTemplates[worldview] || worldTemplates['modern'];
      const template = templates[Math.floor(Math.random() * templates.length)];
      return template.replace('{X}', String(score));
    }
  }

  // 未匹配到关键词，使用通用模板
  const templates = FALLBACK_DESCRIPTIONS[worldview] || FALLBACK_DESCRIPTIONS.modern;
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{X}', String(score));
}

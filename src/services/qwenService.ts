import {
  buildTaskPrompt,
  buildPriorityPrompt,
  buildDecompositionPrompt,
  buildDailyPlanPrompt,
  buildPatternAnalysisPrompt,
  getSmartFallbackDescription,
  QWEN_SYSTEM_PROMPT,
} from '../constants/prompts';
import { TaskDifficulty } from '../types';
import { TimeOfDay } from '../utils/timeOfDay';

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface QwenRequest {
  model: 'qwen-max';
  input: {
    messages: QwenMessage[];
  };
  parameters?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

export interface QwenResponse {
  output: {
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
    }>;
  };
  usage?: {
    total_tokens: number;
  };
}

/**
 * 调用通义千问 API 生成文本
 */
export async function callQwenAPI(
  apiKey: string,
  messages: QwenMessage[],
  params?: QwenRequest['parameters']
): Promise<string> {
  if (!apiKey) {
    throw new Error('API Key 未配置');
  }

  const requestBody: QwenRequest = {
    model: 'qwen-max',
    input: { messages },
    parameters: {
      temperature: 0.9,
      max_tokens: 500,
      ...params,
    },
  };

  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API 调用失败 (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error?.message || errorMessage;
    } catch {
      // 使用默认错误信息
    }
    throw new Error(errorMessage);
  }

  const data: QwenResponse = await response.json();
  return data.output.choices[0].message.content.trim();
}

/**
 * 生成 RPG 任务描述
 */
export async function generateRpgDescription(
  apiKey: string,
  taskName: string,
  worldview: string,
  historyDescriptions: string[],
  difficulty: TaskDifficulty = 'normal',
  timeOfDay: TimeOfDay = 'afternoon',
  score: number = 30
): Promise<string> {
  const prompt = buildTaskPrompt({
    taskName,
    worldview,
    difficulty,
    timeOfDay,
    historyDescriptions,
  });

  const messages: QwenMessage[] = [
    { role: 'system', content: QWEN_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  try {
    const description = await callQwenAPI(apiKey, messages);
    return description;
  } catch (error) {
    console.error('[Qwen] 生成失败，使用智能降级方案:', error);
    return getSmartFallbackDescription(worldview, taskName, score);
  }
}

/**
 * AI 任务优先级推荐
 */
export async function generatePrioritySuggestions(
  apiKey: string,
  tasks: Array<{ name: string; difficulty: string; duration: number }>
): Promise<{ order: number[]; reasons: string[] }> {
  const prompt = buildPriorityPrompt(tasks);

  const messages: QwenMessage[] = [
    { role: 'system', content: QWEN_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  try {
    const response = await callQwenAPI(apiKey, messages);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法解析AI响应');
  } catch (error) {
    console.error('[Qwen] 优先级推荐失败:', error);
    return {
      order: tasks.map((_, i) => i + 1),
      reasons: tasks.map(() => '按默认顺序执行'),
    };
  }
}

/**
 * AI 任务分解建议
 */
export async function generateTaskDecomposition(
  apiKey: string,
  taskName: string,
  difficulty: string
): Promise<string[]> {
  const prompt = buildDecompositionPrompt(taskName, difficulty);

  const messages: QwenMessage[] = [
    { role: 'system', content: QWEN_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  try {
    const response = await callQwenAPI(apiKey, messages);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result.subtasks || [];
    }
    throw new Error('无法解析AI响应');
  } catch (error) {
    console.error('[Qwen] 任务分解失败:', error);
    return ['准备阶段', '执行阶段', '完成阶段'];
  }
}

/**
 * AI 每日任务计划生成
 */
export async function generateDailyPlan(
  apiKey: string,
  tasks: Array<{ name: string; difficulty: string; duration: number }>,
  availableTime: number,
  worldview: string
): Promise<{ selected: number[]; plan: string }> {
  const prompt = buildDailyPlanPrompt(tasks, availableTime, worldview);

  const messages: QwenMessage[] = [
    { role: 'system', content: QWEN_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  try {
    const response = await callQwenAPI(apiKey, messages);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法解析AI响应');
  } catch (error) {
    console.error('[Qwen] 计划生成失败:', error);
    const selected = tasks
      .slice(0, 3)
      .map((_, i) => i + 1);
    return {
      selected,
      plan: `今日计划：按顺序完成 ${tasks.slice(0, 3).map(t => t.name).join('、')}`,
    };
  }
}

/**
 * AI 任务完成模式分析
 */
export async function analyzeTaskPatterns(
  apiKey: string,
  completedTasks: Array<{ name: string; difficulty: string; duration: number; completedAt: string }>
): Promise<{ patterns: string[]; suggestions: string[] }> {
  const prompt = buildPatternAnalysisPrompt(completedTasks);

  const messages: QwenMessage[] = [
    { role: 'system', content: QWEN_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  try {
    const response = await callQwenAPI(apiKey, messages);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法解析AI响应');
  } catch (error) {
    console.error('[Qwen] 模式分析失败:', error);
    return {
      patterns: ['暂无足够数据进行分析'],
      suggestions: ['继续完成任务以积累数据'],
    };
  }
}

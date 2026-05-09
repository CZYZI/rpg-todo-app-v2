import { useState, useCallback } from 'react';
import { callQwenAPI, QwenMessage } from '../services/qwenService';
import { getStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { TaskDifficulty } from '../types';
import { TimeOfDay } from '../utils/timeOfDay';

interface UseQwenAPIReturn {
  loading: boolean;
  error: string | null;
  generateText: (messages: QwenMessage[]) => Promise<string>;
  generateTaskDescription: (params: {
    taskName: string;
    worldview: string;
    historyDescriptions: string[];
    difficulty?: TaskDifficulty;
    timeOfDay?: TimeOfDay;
    score?: number;
  }) => Promise<string>;
  generatePrioritySuggestions: (
    tasks: Array<{ name: string; difficulty: string; duration: number }>
  ) => Promise<{ order: number[]; reasons: string[] }>;
  generateTaskDecomposition: (
    taskName: string;
    difficulty: string
  ) => Promise<string[]>;
  generateDailyPlan: (
    tasks: Array<{ name: string; difficulty: string; duration: number }>,
    availableTime: number,
    worldview: string
  ) => Promise<{ selected: number[]; plan: string }>;
  analyzeTaskPatterns: (
    completedTasks: Array<{ name: string; difficulty: string; duration: number; completedAt: string }>
  ) => Promise<{ patterns: string[]; suggestions: string[] }>;
}

export function useQwenAPI(): UseQwenAPIReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateText = useCallback(async (messages: QwenMessage[]): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = getStorage<string | null>(STORAGE_KEYS.QWEN_API_KEY, null);
      if (!apiKey) {
        throw new Error('请先在设置中配置通义千问 API Key');
      }
      const result = await callQwenAPI(apiKey, messages);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTaskDescription = useCallback(
    async (params: {
      taskName: string;
      worldview: string;
      historyDescriptions: string[];
      difficulty?: TaskDifficulty;
      timeOfDay?: TimeOfDay;
      score?: number;
    }): Promise<string> => {
      const {
        taskName,
        worldview,
        historyDescriptions,
        difficulty = 'normal',
        timeOfDay = 'afternoon',
        score = 30,
      } = params;

      setLoading(true);
      setError(null);
      try {
        const apiKey = getStorage<string | null>(STORAGE_KEYS.QWEN_API_KEY, null);
        if (!apiKey) {
          throw new Error('请先在设置中配置通义千问 API Key');
        }
        // 动态导入以避免循环依赖
        const { generateRpgDescription } = await import('../services/qwenService');
        const result = await generateRpgDescription(
          apiKey,
          taskName,
          worldview,
          historyDescriptions,
          difficulty,
          timeOfDay,
          score
        );
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generatePrioritySuggestions = useCallback(
    async (
      tasks: Array<{ name: string; difficulty: string; duration: number }>
    ): Promise<{ order: number[]; reasons: string[] }> => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = getStorage<string | null>(STORAGE_KEYS.QWEN_API_KEY, null);
        if (!apiKey) {
          throw new Error('请先在设置中配置通义千问 API Key');
        }
        const { generatePrioritySuggestions } = await import('../services/qwenService');
        const result = await generatePrioritySuggestions(apiKey, tasks);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateTaskDecomposition = useCallback(
    async (taskName: string, difficulty: string): Promise<string[]> => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = getStorage<string | null>(STORAGE_KEYS.QWEN_API_KEY, null);
        if (!apiKey) {
          throw new Error('请先在设置中配置通义千问 API Key');
        }
        const { generateTaskDecomposition } = await import('../services/qwenService');
        const result = await generateTaskDecomposition(apiKey, taskName, difficulty);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateDailyPlan = useCallback(
    async (
      tasks: Array<{ name: string; difficulty: string; duration: number }>,
      availableTime: number,
      worldview: string
    ): Promise<{ selected: number[]; plan: string }> => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = getStorage<string | null>(STORAGE_KEYS.QWEN_API_KEY, null);
        if (!apiKey) {
          throw new Error('请先在设置中配置通义千问 API Key');
        }
        const { generateDailyPlan } = await import('../services/qwenService');
        const result = await generateDailyPlan(apiKey, tasks, availableTime, worldview);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const analyzeTaskPatterns = useCallback(
    async (
      completedTasks: Array<{ name: string; difficulty: string; duration: number; completedAt: string }>
    ): Promise<{ patterns: string[]; suggestions: string[] }> => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = getStorage<string | null>(STORAGE_KEYS.QWEN_API_KEY, null);
        if (!apiKey) {
          throw new Error('请先在设置中配置通义千问 API Key');
        }
        const { analyzeTaskPatterns } = await import('../services/qwenService');
        const result = await analyzeTaskPatterns(apiKey, completedTasks);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    generateText,
    generateTaskDescription,
    generatePrioritySuggestions,
    generateTaskDecomposition,
    generateDailyPlan,
    analyzeTaskPatterns,
  };
}

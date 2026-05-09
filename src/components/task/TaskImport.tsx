import { useState } from 'react';
import { Box, Button, TextField, CircularProgress } from '@mui/material';
import { Paste } from '@mui/icons-material';

interface TaskImportProps {
  onImport: (text: string) => void;
  loading: boolean;
}

export function TaskImport({ onImport, loading }: TaskImportProps) {
  const [text, setText] = useState('');

  const handleImport = () => {
    if (text.trim()) {
      onImport(text);
      setText('');
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error('无法读取剪贴板:', err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  return (
    <Box className="w-full max-w-md">
      <Box className="flex gap-2 mb-4">
        <Button
          variant="outlined"
          startIcon={<Paste />}
          onClick={handlePaste}
        >
          粘贴
        </Button>
        <Button
          variant="outlined"
          component="label"
        >
          上传文件
          <input
            type="file"
            accept=".txt,.csv"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      <TextField
        multiline
        rows={10}
        fullWidth
        placeholder="输入待办事项，每行一个..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mb-4"
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleImport}
        disabled={loading || text.trim().length === 0}
      >
        {loading ? <CircularProgress size={24} /> : '导入任务'}
      </Button>

      <Box className="mt-4 text-sm text-gray-500">
        <p>提示：</p>
        <ul className="list-disc pl-5">
          <li>每行输入一个待办事项</li>
          <li>支持从文本文件导入</li>
          <li>AI 将自动生成 RPG 风格的任务描述</li>
        </ul>
      </Box>
    </Box>
  );
}

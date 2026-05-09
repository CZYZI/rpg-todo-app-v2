import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/rpg-todo-app-v2/', // GitHub Pages 部署路径
  server: {
    port: 3000,
    open: true,
  },
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), viteSingleFile()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      outDir: 'dist',
      assetsInlineLimit: 100000000, // 100MB，确保所有资源都被内联
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    define: {
      // 定义环境变量，用于控制是否显示提示词管理功能
      __HIDE_PROMPT_MANAGEMENT__: env.VITE_HIDE_PROMPT_MANAGEMENT === 'true',
    }
  };
});

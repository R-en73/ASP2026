import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ASP2026/',
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // ベンダーライブラリを分割して長期キャッシュ + 並列読み込みを実現
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-hot-toast', 'clsx'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'icons': ['lucide-react'],
        },
      },
    },
  },
});

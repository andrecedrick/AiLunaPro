import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom/')) return 'react-vendor'
          if (id.includes('node_modules/react/'))     return 'react-vendor'
          if (id.includes('firebase/firestore'))      return 'firebase-store'
          if (id.includes('firebase/auth'))           return 'firebase-auth'
          if (id.includes('firebase/app'))            return 'firebase-auth'
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
  server: {
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/DashboardPage.tsx',
        './src/pages/LoginPage.tsx',
      ],
    },
  },
})

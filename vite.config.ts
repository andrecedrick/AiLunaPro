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
        // Vendor splits only — let Vite auto-split app code via lazy().
        // Each lazy(import('./PageX')) gets its own chunk. Admin panels are
        // already lazy() inside BillingSettingsPage, so they natively split.
        manualChunks(id) {
          const p = id.replace(/\\/g, '/')
          if (!p.includes('node_modules/')) return  // app code → auto-split
          if (p.includes('@firebase/firestore'))                       return 'firebase-store'
          if (p.includes('@firebase/auth') || p.includes('@firebase/app')) return 'firebase-auth'
          if (p.includes('@firebase'))                                  return 'firebase-vendor'
          if (p.includes('node_modules/react-dom') || p.includes('node_modules/scheduler')) return 'react-vendor'
          if (p.includes('node_modules/react/'))                       return 'react-vendor'
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
    // Dev proxy → Cloudflare Worker.
    // Allows frontend to call relative paths (/api/..., /healthz)
    // and avoid CORS preflight + IPv6/IPv4 host mismatch.
    proxy: {
      '/api':     { target: 'http://127.0.0.1:8787', changeOrigin: true, secure: false },
      '/healthz': { target: 'http://127.0.0.1:8787', changeOrigin: true, secure: false },
    },
  },
})

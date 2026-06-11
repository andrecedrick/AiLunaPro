import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * Stale-bundle recovery (deploy-integrity): every build gets a unique BUILD_ID,
 * exposed three ways so the running app can detect that a newer deployment
 * replaced its chunks (Cloudflare Pages serves ONLY the current deployment's
 * assets — an open tab navigating after a redeploy requests old chunk URLs):
 *   1. `__BUILD_ID__` compile-time constant (baked into the running bundle),
 *   2. `dist/version.json` (what the SERVER currently has),
 *   3. `<meta name="ailunapro-build">` in index.html (for the boot watchdog).
 * On a chunk-load failure the app compares 1 vs 2: mismatch ⇒ stale tab ⇒
 * forced reload (converges — after reload they match). See staleBundle.ts.
 */
const BUILD_ID = new Date().toISOString().replace(/[:.]/g, '-')

function buildIdPlugin(): Plugin {
  return {
    name: 'ailunapro-build-id',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace('</head>', `  <meta name="ailunapro-build" content="${BUILD_ID}" />\n  </head>`)
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ buildId: BUILD_ID }) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), buildIdPlugin()],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
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

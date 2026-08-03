import { defineConfig, loadEnv, type Plugin } from 'vite'
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

/**
 * Client configuration required for the app to boot at all.
 *
 * Vite inlines `import.meta.env.VITE_*` at BUILD time. A build without them
 * produces a bundle whose Firebase config is empty strings — it compiles, it
 * deploys, and then every visitor sits on "Still connecting…" forever because
 * auth can never initialise. There is no runtime error to catch and no log to
 * read; the app is simply dead.
 *
 * That is exactly what happened when CI took over deployment: local builds
 * picked up `.env.production` from disk, and the CI runner has no such file.
 * A build that cannot produce a working bundle must FAIL, not ship.
 */
const REQUIRED_CLIENT_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const

/**
 * Data-layer domains that MUST resolve to Firebase in a production bundle.
 *
 * `resolveLayer()` falls back to `'mock'` when these are unset, and
 * `assertProductionLayers()` throws at boot to stop a fake session being shown
 * over throwaway data. That runtime guard is right, but it fires in the
 * VISITOR's browser — the bundle still builds, still deploys, and is simply dead
 * on arrival. Checking here turns that into a failed build, which is the same
 * reason the Firebase keys are checked: a build that cannot produce a working
 * bundle must not ship.
 *
 * A domain is satisfied by its own var or by the global `VITE_DATA_LAYER`,
 * mirroring the resolver's own precedence.
 */
const REQUIRED_FIREBASE_LAYERS = ['VITE_AUTH_LAYER', 'VITE_BILLING_LAYER'] as const

function requiredEnvPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'ailunapro-required-client-env',
    apply: 'build',
    buildStart() {
      const problems: string[] = []

      const missing = REQUIRED_CLIENT_ENV.filter(k => !(env[k] ?? '').trim())
      if (missing.length) {
        problems.push(
          `missing ${missing.join(', ')} — without these the deployed app cannot ` +
          'initialise Firebase and every visitor is stuck on "Still connecting…"',
        )
      }

      const globalLayer = (env.VITE_DATA_LAYER ?? '').trim()
      const wrongLayer = REQUIRED_FIREBASE_LAYERS.filter(k => {
        const resolved = (env[k] ?? '').trim() || globalLayer
        return resolved !== 'firebase'
      })
      if (wrongLayer.length) {
        problems.push(
          `${wrongLayer.join(', ')} does not resolve to "firebase" (set it, or set ` +
          'VITE_DATA_LAYER=firebase) — the bundle would boot against mock data and ' +
          'assertProductionLayers() would throw in the visitor\'s browser',
        )
      }

      if (problems.length === 0) return
      throw new Error(
        'Cannot build a working bundle:\n' +
        problems.map(p => `  - ${p}`).join('\n') +
        '\nLocally: set them in .env.production. In CI: add them to the build step ' +
        'env (see .github/workflows/ci.yml).',
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), buildIdPlugin(), requiredEnvPlugin(loadEnv(mode, __dirname, 'VITE_'))],
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
}))

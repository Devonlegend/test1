import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
    include: /\.jsx?$/,
  },
  resolve: {
    alias: [
      // Preserve the `@/...` import style used throughout the ported Next.js
      // code. Anchored regex ensures `@/services` resolves to `src/services`
      // without matching unrelated substrings.
      { find: /^@\/(.*)$/, replacement: fileURLToPath(new URL('./src/$1', import.meta.url)) },

      // Shim Next.js packages with thin React-Router-compatible wrappers so
      // ported code keeps its `import Link from "next/link"` and
      // `import { useRouter, usePathname, useSearchParams, useParams }
      //   from "next/navigation"` imports unchanged.
      { find: /^next\/link$/, replacement: fileURLToPath(new URL('./src/shims/next-link.jsx', import.meta.url)) },
      { find: /^next\/navigation$/, replacement: fileURLToPath(new URL('./src/shims/next-navigation.js', import.meta.url)) },

      // next-themes → our tiny in-house ThemeProvider so ported admin code
      // keeps its `import { useTheme, ThemeProvider } from "next-themes"`.
      { find: /^next-themes$/, replacement: fileURLToPath(new URL('./src/theme/next-themes.jsx', import.meta.url)) },
    ],
  },
  server: {
    port: 5173,
    // During dev, proxy /api → Django backend so the SPA behaves exactly like
    // the old Next.js middleware. Cookies flow through automatically.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['lucide-react'],
          'vendor-data': ['axios'],
        },
      },
    },
  },
})

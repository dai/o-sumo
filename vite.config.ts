import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3001,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './app/test/setup.ts',
    globals: true,
  },
})

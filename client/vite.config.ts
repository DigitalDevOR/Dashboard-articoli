import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve('../deploy_server/ftp/frontend/html'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '.replit.dev',
      'f06a7ea9-ed99-4d0a-a110-7448a2907053-00-lz2x9n10mem.picard.replit.dev'
    ],
    hmr: {
      port: 5173,
    },
  },
})
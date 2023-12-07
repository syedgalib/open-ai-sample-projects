import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@root': path.resolve(__dirname, './'),
      '@app': path.resolve(__dirname, './src/apps/'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@scss': path.resolve(__dirname, './src/scss'),
    }
  }
})

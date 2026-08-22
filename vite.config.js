import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { univerPlugin } from "@univerjs/vite-plugin";
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    univerPlugin(),
    vue(),
    vueDevTools(),
  ],
  optimizeDeps: {
    include: ['simple-calendar-js']
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
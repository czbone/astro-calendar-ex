import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      // デフォルトのベーススタイルを無効にする
      applyBaseStyles: false
    }),
    icon({
      include: {
        mdi: ['*']
      }
    })
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: { port: 3000, host: true },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  }
})

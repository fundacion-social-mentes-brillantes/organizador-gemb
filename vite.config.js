import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'brand/logo-light.png',
        'brand/logo-dark.png',
        'brand/logo-pink.png',
        'brand/app-icon-light.png',
        'brand/app-icon-dark.png',
        'brand/app-icon-pink.png'
      ],
      manifest: {
        name: 'Organizador GEMB',
        short_name: 'GEMB Tareas',
        description: 'Organizador de Tareas de Gimnasio Emocional Mentes Brillantes',
        theme_color: '#102A56',
        background_color: '#F8F7F4',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})

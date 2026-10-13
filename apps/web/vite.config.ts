import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'BOSS IA',
        short_name: 'BOSS IA',
        description: "Ton directeur d'atelier IA : que dois-je faire aujourd'hui ?",
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#FBF7F2',
        theme_color: '#2B2A33',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: { navigateFallbackDenylist: [/^\/api\//] },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:8787' } },
});

import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `vite build --mode standalone` : un seul fichier HTML qui s'ouvre d'un double-clic
// (ou publié tel quel), sans serveur ni service worker.
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  return {
    base: standalone ? './' : '/',
    plugins: [
      react(),
      standalone
        ? viteSingleFile()
        : VitePWA({
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
    resolve: standalone
      ? { alias: { 'virtual:pwa-register': fileURLToPath(new URL('./src/lib/pwa-stub.ts', import.meta.url)) } }
      : undefined,
    build: standalone ? { outDir: 'dist-standalone', emptyOutDir: true } : undefined,
    server: { proxy: { '/api': 'http://localhost:8787' } },
  };
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        // Keep default target, but add manual chunking and visualizer
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react')) return 'vendor-react';
                if (id.includes('lucide-react')) return 'vendor-lucide';
                if (id.includes('@supabase')) return 'vendor-supabase';
                return 'vendor';
              }
            }
          },
          plugins: [
            visualizer({
              filename: 'dist/bundle-visualizer.html',
              title: 'Bundle Visualizer - VoltVibe',
              template: 'treemap',
              gzipSize: true,
              brotliSize: true,
              open: false
            })
          ]
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

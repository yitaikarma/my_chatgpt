import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'
import VueDevtools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv) => {
  console.log('mode', mode, loadEnv(mode, process.cwd()).VITE_BASE_URL) //127.0.0.1:8080

  return defineConfig({
    plugins: [
      VueDevtools(),
      vue(),
      vueJsx(),
      AutoImport({
        resolvers: [ElementPlusResolver(), NaiveUiResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver(), NaiveUiResolver()]
      }),
      {
        ...viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'gzip',
          ext: '.gz'
        }),
        apply: 'build'
      }
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '#': fileURLToPath(new URL('./types', import.meta.url))
      }
    },

    css: {
      preprocessorOptions: {
        scss: {
          // additionalData: '@import "./src/styles/index.scss";'
          // additionalData: '@import "@/styles/index.scss";'
        }
      }
    },

    server: {
      host: '0.0.0.0',
      port: 8080,
      // open: true,
      https: false,
      proxy: {
        '/api': {
          target: '要代理的地址',
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      }
    },

    build: {
      // outDir: 'dist',
      // assetsDir: 'assets',
      // minify: 'terser',
      // sourcemap: false,
      // terserOptions: {
      //   compress: {
      //     keep_infinity: true,
      //     drop_console: true,
      //   },
      // },
      // chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            elemetIcons: ['@element-plus/icons-vue']
          }
        }
      }
    }
  })
}

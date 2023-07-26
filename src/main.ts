import './styles/index.scss'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from './stores'

const app = createApp(App)

import * as ElementPlusIconsVue from '@element-plus/icons-vue' //引入图标
import 'element-plus/dist/index.css' //引入样式
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.mount('#app')

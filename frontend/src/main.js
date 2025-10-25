import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入样式文件
import './assets/css/main.css'
import './assets/css/components.css'

// 引入认证路由守卫
import { createRouteGuard } from './utils/auth.js'

const app = createApp(App)

app.use(store)
app.use(router)

// 设置路由守卫
createRouteGuard(router, store)

app.mount('#app')
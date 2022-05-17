import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'element-plus/dist/index.css'
import './style/index.scss'

createApp(App).use(store).use(router).use(ElementPlus, { locale: zhCn }).mount('#app')

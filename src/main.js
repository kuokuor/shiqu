import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'element-plus/dist/index.css'
import './style/index.scss'

createApp(App).use(store).use(router).use(ElementPlus).mount('#app')

import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import {router} from '@/router/index.js'

// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';

import 'tdesign-site-components';
import 'tdesign-site-components/lib/styles/style.css';
import 'tdesign-site-components/lib/styles/prism-theme.less';
import 'tdesign-site-components/lib/styles/prism-theme-dark.less';

const pinia = createPinia()

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app')

document.documentElement.setAttribute('theme-mode', 'dark');

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//  配置字体图标样式
import './assets/fonts/iconfont.css'
import './assets/font_2/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
//  导入第三方 table 插件
import ZKTable from 'vue-table-with-tree-grid'
//  导入富文本编辑器 插件
import VueQuillEditor from 'vue-quill-editor'
//  富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//  导入 NProgress 包的JS 和 CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
//  配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//  配置 axios 请求拦截器  显示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  NProgress.start()
  //  为请求头对象添加 Token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //  在后面必须 return config
  return config
})
//  配置 axios 请求响应器  隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
//  把 axios 请求挂在到全局
Vue.prototype.$http = axios

Vue.config.productionTip = false

//  注册第三方 table 插件
Vue.component('tree-table', ZKTable)

//  全局时间过滤器
Vue.filter('dateFormat', function (originval) {
  const dt = new Date(originval)
  //  年月日
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '')
  //  时分秒
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
//  全局注册富文本编辑器
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

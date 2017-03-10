// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

import VueResource from 'vue-resource' // handle http

Vue.use(ElementUI)
Vue.use(VueResource)

let eventHub = new Vue()
/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  // render: h => h(App),
  components: { App },
  data () {
    return {
      eventHub
    }
  }
})

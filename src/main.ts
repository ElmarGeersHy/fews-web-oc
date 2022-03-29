import '@/router/class-component-hooks'
import Vue from 'vue'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify'
import router from './router'
import './plugins/vue2mapbox-gl'
import auth from '@/services/auth'
import { defineCustomElements } from 'fews-ssd-web-component'

defineCustomElements(window)
// Optional: Provide an easy way to register the custom element.

Vue.config.ignoredElements = ['schematic-status-display']

Vue.use(auth)

Vue.config.productionTip = false

new Vue({
  store,
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
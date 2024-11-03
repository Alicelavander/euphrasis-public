import { createApp } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  // theme: {
  //   defaultTheme: 'dark'
  // },
  components,
  directives,
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
  
createApp(App)
    .use(vuetify)
    .use(router)
    .use(pinia)
    .mount('#app')
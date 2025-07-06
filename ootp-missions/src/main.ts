import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useCardStore } from './stores/useCardStore'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')

const cardStore = useCardStore()
await cardStore.initialize()

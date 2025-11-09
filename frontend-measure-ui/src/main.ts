import { createApp } from 'vue'
import App from './App.vue'
import './styles/globals.css'

// Vue Query
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

const app = createApp(App)

const queryClient = new QueryClient()
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')
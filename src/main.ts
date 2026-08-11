import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import router from './router'
import App from './App.vue'
import { globalStyles } from './styles/global'

const app = createApp(App)

// Inject global styles
const styleSheet = document.createElement('style')
styleSheet.textContent = globalStyles
document.head.appendChild(styleSheet)

app.use(createPinia())
app.use(vuetify)
app.use(router)

app.mount('#app')

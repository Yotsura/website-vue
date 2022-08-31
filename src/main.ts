import { createApp } from 'vue'
import { setupStore } from '@/store';
import App from './App.vue'
import router from './router'

// import './assets/main.css'

const app = createApp(App)

setupStore(app);
app.use(router)

app.mount('#app')

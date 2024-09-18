import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import './style.css';
import './assets/styles/orders.css';
import router from './router/index';

// Import PrimeVue i komponentów
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Toast from 'primevue/toast';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import MultiSelect from 'primevue/multiselect';
import '@primevue/themes/aura/';
import 'primeicons/primeicons.css';

// Firebase i inicjalizacja
import { auth, db, storage, messaging, appCheck } from './firebase';
import { handleAuthState } from './auth/userService';

// Importuj tłumaczenia
import en from './locales/en.json';
import pl from './locales/pl.json';

const i18n = createI18n({
  legacy: false,
  locale: 'pl', // domyślny język
  fallbackLocale: 'en',
  messages: { en, pl }
});

const pinia = createPinia();

const app = createApp(App);

app.use(PrimeVue);
app.use(ToastService);
app.use(router);
app.use(i18n);
app.use(pinia);

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Toast', Toast);
app.component('Textarea', Textarea);
app.component('DatePicker', DatePicker);
app.component('MultiSelect', MultiSelect);

handleAuthState();

app.mount('#app');

export { auth, db, storage, messaging, appCheck };

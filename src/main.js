import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import Dashboard from './components/Dashboard.vue';
import UpdateProfile from './components/UpdateProfile.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import AddOrder from './components/AddOrder.vue';
import OrdersList from './components/OrdersList.vue';
import OrderDetails from './components/OrderDetails.vue';
import MyOrders from './components/MyOrders.vue';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getStorage } from 'firebase/storage';

import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import MultiSelect from 'primevue/multiselect';
import 'primeicons/primeicons.css';

import { store } from './store/store';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const appCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true
});

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/update-profile', component: UpdateProfile, meta: { requiresAuth: true } },
  { path: '/admin-dashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/add-order', component: AddOrder, meta: { requiresAuth: true, requiresManager: true } },
  { path: '/orders', component: OrdersList, meta: { requiresAuth: true, requiresManager: true } },
  { path: '/orders/:orderId', component: OrderDetails, meta: { requiresAuth: true } },
  { path: '/my-orders', component: MyOrders, meta: { requiresAuth: true, requiresEmployee: false } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const requiresManager = to.matched.some(record => record.meta.requiresManager);
  const requiresEmployee = to.matched.some(record => record.meta.requiresEmployee);
  const isAuthenticated = auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (requiresAdmin || requiresManager || requiresEmployee) {
    if (!isAuthenticated) {
      next('/login');
    } else {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      if (requiresAdmin && userData.permissions === 'Administrator') {
        next();
      } else if (requiresManager && userData.permissions === 'Manager') {
        next();
      } else if (requiresEmployee && userData.permissions === 'Pracownik') {
        next();
      } else {
        next('/dashboard');
      }
    }
  } else {
    next();
  }
});

const vueApp = createApp(App);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in:", user);
    const userRef = doc(db, 'users', user.uid);
    try {
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        console.log("User document found:", docSnapshot.data());
        vueApp.config.globalProperties.$user = docSnapshot.data();
        store.commit('setUser', docSnapshot.data());
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error getting document:', error);
    }
  } else {
    console.log("No user logged in.");
    vueApp.config.globalProperties.$user = null;
    store.commit('setUser', null);
  }

  vueApp.use(router);
  vueApp.use(store);
  vueApp.config.globalProperties.$db = db;

  vueApp.use(PrimeVue, {
    locale: {
      passwordPrompt: 'Wprowadź hasło',
      weak: 'Słabe',
      medium: 'Średnie',
      strong: 'Silne',
    }
  });
  vueApp.use(ToastService);
  vueApp.component('InputText', InputText);
  vueApp.component('Password', Password);
  vueApp.component('Button', Button);
  vueApp.component('Toast', Toast);
  vueApp.component('Textarea', Textarea);
  vueApp.component('DatePicker', DatePicker);
  vueApp.component('MultiSelect', MultiSelect);

  vueApp.mount('#app');
});

export { auth, db, storage, appCheck };

<template>
    <body v-bind:class="{ dark: isDarkMode, light: !isDarkMode }">
      <div>
        <button @click="toggleTheme" class="theme-toggle-btn">
          <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i> Zmień motyw
        </button>
        <div class="orders-list">
          <h1>Moje Zlecenia</h1>
          <div v-if="orders.length === 0">Brak przypisanych zleceń.</div>
          <div v-else>
            <div v-for="order in orders" :key="order.id" class="order">
              <h2>Zlecenie {{ order.orderNumber }}</h2>
              <p><strong>Nazwa Zlecenia:</strong> {{ order.orderName }}</p>
              <p><strong>Data Rozpoczęcia:</strong> {{ formatDate(order.startDate) }}</p>
              <p><strong>Data Zakończenia:</strong> {{ formatDate(order.endDate) }}</p>
              <p><strong>Adres Lokalizacji:</strong> {{ order.address }} 
                <a :href="mapLink(order.address)" target="_blank">
                  <i class="pi pi-map"></i>
                </a>
              </p>
              <button @click="viewOrder(order.id)">Zobacz Zlecenie</button>
            </div>
          </div>
        </div>
      </div>
    </body>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
  import { db, auth } from '@/main';
  import { useStore } from 'vuex';
  import { format, parseISO } from 'date-fns';
  
  export default {
    name: 'MyOrders',
    setup() {
      const orders = ref([]);
      const isDarkMode = ref(false);
      const store = useStore();
      const userId = store.state.user.id;
      const themeDocRef = doc(db, 'users', userId, 'preferences', 'theme');
  
      const fetchOrders = async () => {
        const user = auth.currentUser;
        if (user) {
          const q = query(collection(db, 'orders'), where('assignedUsers', 'array-contains', user.uid));
          const querySnapshot = await getDocs(q);
          orders.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      };
  
      const fetchUserThemePreference = async () => {
        try {
          const themeDoc = await getDoc(themeDocRef);
          if (themeDoc.exists()) {
            isDarkMode.value = themeDoc.data().darkMode;
            document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
          }
        } catch (error) {
          console.error('Error fetching user theme preference:', error);
        }
      };
  
      const toggleTheme = async () => {
        isDarkMode.value = !isDarkMode.value;
        document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
        try {
          await updateDoc(themeDocRef, { darkMode: isDarkMode.value });
        } catch (error) {
          console.error('Error updating theme:', error);
        }
      };
  
      const formatDate = (date) => {
        try {
          const dateObj = parseISO(date);
          return format(dateObj, 'yyyy-MM-dd HH:mm');
        } catch {
          return date;
        }
      };
  
      const mapLink = (address) => {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      };
  
      const viewOrder = (orderId) => {
        this.$router.push(`/orders/${orderId}`);
      };
  
      onMounted(async () => {
        await fetchOrders();
        await fetchUserThemePreference();
      });
  
      return { orders, isDarkMode, toggleTheme, viewOrder, formatDate, mapLink };
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Roboto:wght@400;700&display=swap');
  
  body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
  }
  
  .dark {
    --background-color: #333;
    --text-color: #fff;
    --border-color: #ccc;
    --field-background: #222;
    --input-background: #555;
  }
  
  .light {
    --background-color: #f0f0f0;
    --text-color: #333;
    --border-color: #333;
    --field-background: #fff;
    --input-background: #ddd;
  }
  
  body.dark {
    background-color: var(--background-color);
    color: var(--text-color);
  }
  
  body.light {
    background-color: var(--background-color);
    color: var(--text-color);
  }
  
  .theme-toggle-btn {
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: var(--secondary-color);
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
    z-index: 1000;
  }
  
  .theme-toggle-btn:hover {
    background-color: var(--primary-color);
    transform: scale(1.05);
  }
  
  .orders-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 2em;
  }
  
  .order {
    background: var(--field-background);
    padding: 1em;
    margin-bottom: 1em;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    color: var(--text-color);
  }
  
  button {
    padding: 0.5em 1em;
    color: white;
    background-color: #42b983;
    border: none;
    cursor: pointer;
    margin-top: 1em;
  }
  
  button:hover {
    background-color: #36966c;
  }
  </style>
  
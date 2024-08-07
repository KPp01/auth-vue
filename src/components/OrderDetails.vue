<template>
    <div v-bind:class="{ dark: isDarkMode, light: !isDarkMode }">
      <button @click="toggleTheme" class="theme-toggle-btn">
        <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i> Zmień motyw
      </button>
      <div class="order-details">
        <h1>Szczegóły Zlecenia</h1>
        <div v-if="order">
          <p><strong>Numer Zlecenia:</strong> {{ order.orderNumber }}</p>
          <p><strong>Nazwa Zlecenia:</strong> {{ order.orderName }}</p>
          <p><strong>Dane Klienta:</strong> {{ order.clientData }}</p>
          <p><strong>Osoby Realizujące:</strong> {{ getUsers(order.assignedUsers) }}</p>
          <p><strong>Data Rozpoczęcia:</strong> {{ formatDate(order.startDate) }}</p>
          <p><strong>Data Zakończenia:</strong> {{ formatDate(order.endDate) }}</p>
          <p><strong>Adres:</strong> {{ order.address }}</p>
          <p><strong>Główne Zadanie:</strong> {{ order.mainTasks[0]?.task }}</p>
          <p><strong>Podpunkty:</strong></p>
          <ul>
            <li v-for="subTask in order.mainTasks[0]?.subTasks" :key="subTask">{{ subTask }}</li>
          </ul>
          <p><strong>Materiały:</strong></p>
          <ul>
            <li v-for="material in order.materials" :key="material">{{ material }}</li>
          </ul>
          <p><strong>Narzędzia:</strong></p>
          <ul>
            <li v-for="tool in order.tools" :key="tool">{{ tool }}</li>
          </ul>
          <button @click="saveOrder">Zapisz zmiany</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import { db } from '@/main';
  import { useStore } from 'vuex';
  import { format } from 'date-fns';
  
  export default {
    name: 'OrderDetails',
    setup() {
      const order = ref(null); // Reaktywny obiekt dla zlecenia
      const isDarkMode = ref(false); // Reaktywny obiekt dla trybu ciemnego/jasnego
      const store = useStore();
      const userId = store.state.user.id;
      const route = useRoute();
      const themeDocRef = doc(db, 'users', userId, 'preferences', 'theme');
  
      const orderId = route.params.orderId; // Pobranie parametru orderId z trasy
  
      // Funkcja do pobierania szczegółów zlecenia
      const fetchOrder = async (orderId) => {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          order.value = orderDoc.data();
        }
      };
  
      // Funkcja do pobierania preferencji trybu ciemnego/jasnego użytkownika
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
  
      // Funkcja do przełączania trybu ciemnego/jasnego
      const toggleTheme = async () => {
        isDarkMode.value = !isDarkMode.value;
        document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
        try {
          await updateDoc(themeDocRef, { darkMode: isDarkMode.value });
        } catch (error) {
          console.error('Error updating theme:', error);
        }
      };
  
      // Funkcja do formatowania daty
      const formatDate = (date) => {
        try {
          const dateObj = new Date(date);
          return format(dateObj, 'yyyy-MM-dd HH:mm');
        } catch {
          return date;
        }
      };
  
      // Funkcja do zapisywania zmian w zleceniu
      const saveOrder = async () => {
        if (order.value) {
          try {
            await updateDoc(doc(db, 'orders', orderId), order.value);
            alert('Zlecenie zaktualizowane pomyślnie');
          } catch (error) {
            console.error('Error updating order:', error);
          }
        }
      };
  
      // Funkcja do pobierania nazw użytkowników realizujących zlecenie
      const getUsers = (assignedUsers) => {
        // Implement logic to fetch user details based on assigned user IDs
        return assignedUsers.join(', ');
      };
  
      onMounted(async () => {
        await fetchOrder(orderId); // Pobierz szczegóły zlecenia
        await fetchUserThemePreference(); // Pobierz preferencje trybu ciemnego/jasnego użytkownika
      });
  
      return { order, isDarkMode, toggleTheme, getUsers, formatDate, saveOrder };
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
  
  .order-details {
    max-width: 800px;
    margin: 0 auto;
    padding: 2em;
  }
  
  h1 {
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
  
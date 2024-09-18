<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <NavigationBar @toggle-theme="toggleTheme" />
    <main class="app-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Toast position="bottom-right" />
  </div>
</template>

<script>
import { ref, provide, computed, watch } from 'vue';
import { useDarkModeStore } from './stores/darkModeStore';  // Używamy Pinia store
import { useUserStore } from './stores/userStore'; // Dodajemy import userStore
import NavigationBar from './components/NavigationBar.vue';
import Toast from 'primevue/toast';

export default {
  name: 'App',
  components: {
    NavigationBar,
    Toast,
  },
  setup() {
    const darkModeStore = useDarkModeStore(); // Store Pinia dla trybu ciemnego
    const userStore = useUserStore(); // Store Pinia dla użytkownika
    const isDarkMode = computed(() => darkModeStore.isDarkMode);

    // Śledzenie zmian trybu ciemnego i zapisywanie w localStorage
    watch(isDarkMode, (newValue) => {
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', newValue ? 'dark' : 'light');
    });

    const toggleTheme = () => {
      darkModeStore.toggleDarkMode();
    };

    provide('isDarkMode', isDarkMode);
    provide('user', computed(() => userStore.user)); // Użytkownik z Pinia

    return {
      isDarkMode,
      toggleTheme,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dark-mode {
  background-color: #121212;
  color: white;
}
</style>

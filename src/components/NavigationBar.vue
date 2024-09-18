<template> 
  <nav class="navbar" :class="{ 'navbar-mobile': isMobile }">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-logo">
        <span class="app-name">{{ $t('appName') }}</span>
      </router-link>
      <button @click="toggleMobileMenu" class="navbar-toggle" aria-label="Toggle navigation menu">
        <i class="pi" :class="isMobileMenuOpen ? 'pi-times' : 'pi-bars'"></i>
      </button>
    </div>
    <ul class="nav-list" :class="{ 'nav-list-mobile': isMobile, 'nav-list-open': isMobileMenuOpen }">
      <li class="nav-item">
        <router-link to="/" exact-active-class="active">{{ $t('navigation.home') }}</router-link>
      </li>
      <template v-if="!user">
        <li class="nav-item">
          <router-link to="/login" exact-active-class="active">{{ $t('navigation.login') }}</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/register" exact-active-class="active">{{ $t('navigation.register') }}</router-link>
        </li>
      </template>
      <template v-else>
        <li class="nav-item">
          <router-link to="/dashboard" exact-active-class="active">{{ $t('navigation.dashboard') }}</router-link>
        </li>
        <li v-if="isManagerOrAdmin" class="nav-item">
          <router-link to="/order-dashboard" exact-active-class="active">{{ $t('navigation.orderDashboard') }}</router-link>
        </li>
        <li v-if="isAdmin" class="nav-item">
          <router-link to="/admin-dashboard" exact-active-class="active">{{ $t('navigation.adminDashboard') }}</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/ai-dashboard" exact-active-class="active">{{ $t('navigation.aiDashboard') }}</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/work-hours" exact-active-class="active">{{ $t('navigation.workHours') }}</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/update-profile" exact-active-class="active">{{ $t('navigation.updateProfile') }}</router-link>
        </li>
        <li class="nav-item profile-section">
          <div class="user-profile" @click="toggleProfileMenu" ref="profileMenuTrigger">
            <img v-if="user.profile_picture_url" :src="user.profile_picture_url" :alt="user.displayName" class="nav-profile-picture" />
            <span v-else class="nav-profile-initials">{{ userInitials }}</span>
            <span class="user-name">{{ user.displayName }}</span>
          </div>
          <Transition name="fade">
            <ul v-if="isProfileMenuOpen" class="profile-menu" ref="profileMenu">
              <li @click="navigateTo('/update-profile')">{{ $t('navigation.profile') }}</li>
              <li @click="navigateTo('/settings')">{{ $t('navigation.settings') }}</li>
              <li @click="logout">{{ $t('navigation.logout') }}</li>
            </ul>
          </Transition>
        </li>
      </template>
    </ul>
    <div class="navbar-actions">
      <LanguageSelector />
      <button @click="toggleTheme" class="theme-toggle-btn" :aria-label="isDarkMode ? $t('navigation.lightMode') : $t('navigation.darkMode')">
        <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
      </button>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useDarkModeStore } from '@/stores/darkModeStore';
import { useUserStore } from '@/stores/userStore'; // Pinia store dla użytkownika
import LanguageSelector from '@/components/modulesAI/LanguageSelector.vue';

export default {
  name: 'NavigationBar',
  components: {
    LanguageSelector,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const darkModeStore = useDarkModeStore(); // Pinia store dla trybu ciemnego
    const userStore = useUserStore(); // Pinia store dla użytkownika

    const isMobile = ref(window.innerWidth < 768);
    const isMobileMenuOpen = ref(false);
    const isProfileMenuOpen = ref(false);
    const profileMenuTrigger = ref(null);
    const profileMenu = ref(null);

    // Stan użytkownika z Pinia
    const user = computed(() => userStore.user);
    const isDarkMode = computed(() => darkModeStore.isDarkMode);
    const isAdmin = computed(() => user.value?.permissions === 'Administrator');
    const isManagerOrAdmin = computed(() => ['Manager', 'Administrator'].includes(user.value?.permissions));
    const userInitials = computed(() => {
      if (user.value?.displayName) {
        return user.value.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
      }
      return '';
    });

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    const toggleProfileMenu = (event) => {
      event.stopPropagation();
      isProfileMenuOpen.value = !isProfileMenuOpen.value;
    };

    const toggleTheme = () => {
      darkModeStore.toggleDarkMode(); // Użycie Pinia store do zmiany trybu
    };

    const navigateTo = (path) => {
      router.push(path);
      isProfileMenuOpen.value = false;
      if (isMobile.value) {
        isMobileMenuOpen.value = false;
      }
    };

    const logout = async () => {
      try {
        await userStore.logout(); // Wylogowanie z Pinia store
        userStore.showNotification({
          type: 'success',
          message: t('notifications.logoutSuccess'),
        });
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
        userStore.showNotification({
          type: 'error',
          message: t('notifications.logoutError'),
        });
      }
    };

    const handleResize = () => {
      isMobile.value = window.innerWidth < 768;
      if (!isMobile.value) {
        isMobileMenuOpen.value = false;
      }
    };

    const handleClickOutside = (event) => {
      if (isProfileMenuOpen.value && !profileMenuTrigger.value.contains(event.target) && !profileMenu.value.contains(event.target)) {
        isProfileMenuOpen.value = false;
      }
    };

    onMounted(() => {
      window.addEventListener('resize', handleResize);
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
    });

    watch(isMobileMenuOpen, (isOpen) => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    return {
      user,
      isDarkMode,
      isAdmin,
      isManagerOrAdmin,
      userInitials,
      isMobile,
      isMobileMenuOpen,
      isProfileMenuOpen,
      profileMenuTrigger,
      profileMenu,
      toggleMobileMenu,
      toggleProfileMenu,
      toggleTheme,
      navigateTo,
      logout,
    };
  },
};
</script>
<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--surface-a);
  box-shadow: var(--shadow-2);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.navbar-logo img {
  height: 2rem;
}

.navbar-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
}

.nav-list {
  display: flex;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 0.5rem;
}

.nav-item a {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.nav-item a:hover,
.nav-item a.active {
  background-color: var(--surface-b);
  color: var(--primary-color);
}

.profile-section {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.nav-profile-picture,
.nav-profile-initials {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  font-weight: bold;
}

.user-name {
  font-weight: 500;
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--surface-a);
  border: 1px solid var(--surface-d);
  border-radius: 4px;
  box-shadow: var(--shadow-2);
  padding: 0.5rem 0;
  min-width: 150px;
  z-index: 1000;
}

.profile-menu li {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.profile-menu li:hover {
  background-color: var(--surface-b);
}

.navbar-actions {
  display: flex;
  align-items: center;
}

.theme-toggle-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.theme-toggle-btn:hover {
  background-color: var(--surface-b);
}

@media (max-width: 768px) {
  .navbar-mobile {
    flex-wrap: wrap;
  }

  .navbar-toggle {
    display: block;
  }

  .nav-list-mobile {
    display: none;
    width: 100%;
    flex-direction: column;
    padding: 1rem 0;
  }

  .nav-list-open {
    display: flex;
  }

  .nav-item {
    margin: 0.5rem 0;
  }

  .profile-section {
    order: -1;
    width: 100%;
    margin-bottom: 1rem;
  }

  .user-profile {
    justify-content: center;
  }

  .profile-menu {
    position: static;
    width: 100%;
    box-shadow: none;
    border: none;
    background-color: var(--surface-b);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
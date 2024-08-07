<template>
  <div>
    <nav class="navbar">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link to="/" exact-active-class="active">Strona główna</router-link>
        </li>
        <li v-if="!user" class="nav-item">
          <router-link to="/login" exact-active-class="active">Logowanie</router-link>
        </li>
        <li v-if="!user" class="nav-item">
          <router-link to="/register" exact-active-class="active">Rejestracja</router-link>
        </li>
        <li v-if="user" class="nav-item">
          <router-link to="/dashboard" exact-active-class="active">Panel</router-link>
        </li>
        <li v-if="user" class="nav-item">
          <router-link to="/update-profile" exact-active-class="active">Aktualizacja Profilu</router-link>
        </li>
        <li v-if="user && user.permissions === 'Administrator'" class="nav-item">
          <router-link to="/admin-dashboard" exact-active-class="active">Panel Administratora</router-link>
        </li>
        <li v-if="user" class="nav-item dropdown">
          <span class="dropdown-toggle">Zlecenia</span>
          <div class="dropdown-menu">
            <router-link to="/add-order" exact-active-class="active">Dodaj Zlecenie</router-link>
            <router-link to="/orders" exact-active-class="active">Lista Zleceń</router-link>
            <router-link to="/order-details" exact-active-class="active">Szczegóły Zlecenia</router-link>
            <router-link to="/my-orders" exact-active-class="active">Moje Zlecenia</router-link>
          </div>
        </li>
        <li v-if="user" class="nav-item">
          <img v-if="userData.profilePictureUrl" :src="userData.profilePictureUrl" alt="Profile Picture" class="nav-profile-picture"/>
          <button @click="logout" class="logout-button">Wyloguj</button>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>
<script>
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/main';
import { mapState } from 'vuex';

export default {
  name: 'App',
  computed: {
    ...mapState(['user']),
    userData() {
      return this.user || {};
    }
  },
  methods: {
    async logout() {
      const auth = getAuth();
      try {
        await signOut(auth);
        this.$store.commit('setUser', null);
        this.$router.push('/login').then(() => {
          this.$router.go(0);
        });
      } catch (error) {
        console.error('Błąd podczas wylogowywania:', error);
      }
    },
    async fetchUserData() {
      const user = getAuth().currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          this.$store.commit('setUser', userSnapshot.data());
        } else {
          console.log('Nie znaleziono takiego dokumentu!');
        }
      }
    }
  },
  mounted() {
    this.fetchUserData();
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

.navbar {
  background-color: #333;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 15px;
  margin: 0;
}

.nav-item {
  position: relative;
}

.nav-item a,
.nav-item .dropdown-toggle {
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  display: block;
  font-size: 16px; /* Ensure all nav items have the same font size */
  font-family: 'Roboto', sans-serif; /* Ensure all nav items have the same font family */
  transition: background-color 0.3s;
}

.nav-item a.active,
.nav-item .dropdown-toggle:hover {
  background-color: #4CAF50;
}

.dropdown-menu {
  display: none;
  position: absolute;
  background-color: #333;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-menu a {
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  font-size: 16px; /* Ensure all dropdown items have the same font size */
  font-family: 'Roboto', sans-serif; /* Ensure all dropdown items have the same font family */
  transition: background-color 0.3s;
}

.dropdown-menu a:hover {
  background-color: #555;
}

.nav-item.dropdown:hover .dropdown-menu {
  display: block;
}

.nav-profile-picture {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.logout-button {
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: 'Roboto', sans-serif; /* Ensure logout button has the same font family */
}

.logout-button:hover {
  background-color: #555;
}
</style>

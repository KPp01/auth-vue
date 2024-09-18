<template>
  <div class="dashboard">
    <h1>Panel</h1>
    <p v-if="userData">Witaj, {{ userData.email }}</p>
    <button @click="logout">Wyloguj</button>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUserStore } from '@/stores/userStore'; // Zaktualizowana ścieżka do store Pinia

export default {
  name: 'Dashboard',
  setup() {
    const userStore = useUserStore();
    const userData = userStore.user;

    const logout = () => {
      const auth = getAuth();
      auth.signOut()
        .then(() => {
          userStore.clearUser();
          window.location.href = '/login'; // Alternatywnie można użyć this.$router.push('/login');
        })
        .catch((error) => {
          console.error('Błąd podczas wylogowywania:', error);
        });
    };

    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          userStore.setUser(userSnapshot.data()); // Przechowywanie użytkownika w Pinia
        } else {
          console.log('Nie znaleziono takiego użytkownika!');
        }
      }
    };

    fetchUserData(); // Wywołanie po załadowaniu komponentu

    return {
      userData,
      logout
    };
  }
};
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 2em;
  text-align: center;
}
h1 {
  color: #42b983;
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

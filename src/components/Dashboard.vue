<template>
  <div class="dashboard">
    <h1>Panel</h1>
    <p v-if="userData">Witaj, {{ userData.email }}</p>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/main';
import { mapState } from 'vuex';

export default {
  name: 'Dashboard',
  computed: {
    ...mapState(['user']),
    userData() {
      return this.user || {};
    }
  },
  methods: {
    logout() {
      const auth = getAuth();
      auth.signOut().then(() => {
        this.$router.push('/login');
      }).catch((error) => {
        console.error('Błąd podczas wylogowywania:', error);
      });
    }
  },
  async mounted() {
    const user = getAuth().currentUser;
    if (user) {
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        this.$store.commit('setUser', userSnapshot.data());
      } else {
        console.log('No such document!');
      }
    }
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

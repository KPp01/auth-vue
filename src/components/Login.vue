<template>
  <div class="login">
    <h2>Logowanie</h2>
    <form @submit.prevent="loginWithEmail">
      <input type="email" v-model="email" placeholder="Email" required>
      <input type="password" v-model="password" placeholder="Hasło" required>
      <button type="submit">Zaloguj się</button>
    </form>
    <button @click="signInWithGoogle">Zaloguj się przez Google</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/main';
import { mapActions } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    ...mapActions(['setUser']),
    async signInWithGoogle() {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Fetch or create user data in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          const userData = {
            id: user.uid,
            firstName: user.displayName ? user.displayName.split(' ')[0] : '',
            lastName: user.displayName ? user.displayName.split(' ')[1] : '',
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            permissions: 'user',
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true,
            profile_picture_url: user.photoURL || '',
            last_login: new Date()
          };
          await setDoc(userRef, userData);
          this.setUser(userData);
        } else {
          const userData = userDoc.data();
          this.setUser(userData);
        }

        this.$router.push('/dashboard').then(() => {
          this.$router.go(0);  // Dodajemy odświeżenie strony
        });
      } catch (error) {
        console.error('Błąd podczas logowania:', error);
        this.errorMessage = 'Błąd podczas logowania przez Google: ' + error.message;
      }
    },
    async loginWithEmail() {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        // Fetch user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.setUser(userData);
          this.$router.push('/dashboard').then(() => {
            this.$router.go(0);  // Dodajemy odświeżenie strony
          });
        } else {
          console.error('Nie znaleziono dokumentu!');
          this.errorMessage = 'Nie znaleziono danych użytkownika w Firestore.';
        }
      } catch (error) {
        console.error('Błąd podczas logowania:', error);
        this.errorMessage = 'Błąd podczas logowania przez email: ' + error.message;
      }
    }
  }
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  padding: 2em;
}
form {
  margin-bottom: 1em;
}
input {
  display: block;
  width: 100%;
  padding: 0.5em;
  margin: 0.5em 0;
}
button {
  padding: 0.5em 1em;
  color: white;
  background-color: #42b983;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #36966c;
}
.error {
  color: red;
  margin-top: 1em;
}
</style>

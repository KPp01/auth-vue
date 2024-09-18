<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Rejestracja</h2>

      <!-- Formularz rejestracji -->
      <form @submit.prevent="registerWithEmail" class="register-form">
        <div class="p-field">
          <label for="firstName">Imię</label>
          <input type="text" v-model="firstName" placeholder="Wprowadź imię" class="input-field" required />
        </div>

        <div class="p-field">
          <label for="lastName">Nazwisko</label>
          <input type="text" v-model="lastName" placeholder="Wprowadź nazwisko" class="input-field" required />
        </div>

        <div class="p-field">
          <label for="email">Email</label>
          <input type="email" v-model="email" placeholder="Wprowadź email" class="input-field" required />
        </div>

        <div class="p-field">
          <label for="password">Hasło</label>
          <input type="password" v-model="password" placeholder="Wprowadź hasło" class="input-field" required />
        </div>

        <div class="p-field">
          <label for="confirmPassword">Potwierdź hasło</label>
          <input type="password" v-model="confirmPassword" placeholder="Potwierdź hasło" class="input-field" required />
        </div>

        <!-- reCAPTCHA -->
        <div class="g-recaptcha" :data-sitekey="recaptchaSiteKey"></div>

        <button type="submit" class="register-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span> Zarejestruj się
        </button>
      </form>

      <!-- Opcje logowania -->
      <div class="register-options">
        <button @click="registerWithGoogle" class="google-register-btn">
          <img src="@/components/google-icon.svg" alt="Google" class="btn-icon" /> Zarejestruj się przez Google
        </button>
      </div>

      <!-- Obsługa błędów -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUserStore } from '@/stores/userStore'; // Import Pinia store
import axios from 'axios';

export default {
  name: 'Register',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      loading: false,
      recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
    };
  },
  methods: {
    async registerWithEmail() {
      this.loading = true;
      const userStore = useUserStore(); // Pinia store instance

      try {
        if (this.password !== this.confirmPassword) {
          this.errorMessage = 'Hasła się nie zgadzają';
          this.loading = false;
          return;
        }

        // Weryfikacja reCAPTCHA
        const token = grecaptcha.getResponse();
        if (!token) {
          this.errorMessage = 'Proszę wypełnić reCAPTCHA.';
          this.loading = false;
          return;
        }

        const response = await axios.post('/verify-recaptcha', { token });
        if (!response.data.success) {
          this.errorMessage = 'Weryfikacja reCAPTCHA nie powiodła się.';
          this.loading = false;
          return;
        }

        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: `${this.firstName} ${this.lastName}` });

        // Zapis użytkownika w Firestore
        const userRef = doc(db, 'users', user.uid);
        const userData = {
          id: user.uid,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          permissions: 'user',
          created_at: new Date(),
          updated_at: new Date(),
          is_active: true,
          profile_picture_url: user.photoURL || '',
          last_login: new Date(),
        };
        await setDoc(userRef, userData);

        // Ustawienie użytkownika w Pinia store
        userStore.setUser(userData);
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Błąd podczas rejestracji:', error);
        this.errorMessage = `Błąd rejestracji: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },

    async registerWithGoogle() {
      this.loading = true;
      const userStore = useUserStore(); // Pinia store instance

      try {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Sprawdzenie, czy użytkownik istnieje w Firestore
        const userRef = doc(db, 'users', user.uid);
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
          last_login: new Date(),
        };

        await setDoc(userRef, userData);
        userStore.setUser(userData); // Ustawienie użytkownika w Pinia store
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Błąd podczas rejestracji przez Google:', error);
        this.errorMessage = `Błąd rejestracji: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f4f8;
  padding: 2rem;
}

.register-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.register-btn {
  background-color: #42b983;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.register-btn:disabled {
  background-color: #ccc;
}

.google-register-btn {
  background-color: #db4437;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.error-message {
  color: red;
  margin-top: 1rem;
}
</style>

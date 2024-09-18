<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="title">Zaloguj się</h2>
      <form @submit.prevent="loginWithEmail" class="login-form">
        <input type="email" v-model="email" placeholder="Email" class="input-field" required />
        <input type="password" v-model="password" placeholder="Hasło" class="input-field" required />
        <div class="g-recaptcha" :data-sitekey="recaptchaSiteKey"></div>
        <button type="submit" class="login-btn" :disabled="loading">
          <img src="@/components/login-icon.svg" alt="Login" class="btn-icon" />
          <span v-if="loading" class="spinner"></span>Zaloguj się
        </button>
      </form>
      <div class="login-options">
        <button @click="signInWithGoogle" class="google-login-btn">
          <img src="@/components/google-icon.svg" alt="Google" class="btn-icon" />
          Zaloguj się przez Google
        </button>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUserStore } from '@/stores/userStore'; // Pinia store
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      loading: false,
      recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
    };
  },
  methods: {
    // Logowanie przez Google
    async signInWithGoogle() {
      this.loading = true;
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const userStore = useUserStore(); // Używamy Pinia store

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

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
            last_login: new Date(),
          };
          await setDoc(userRef, userData);
          userStore.setUser(userData); // Ustawienie użytkownika w Pinia store
        } else {
          const userData = userDoc.data();
          userStore.setUser(userData); // Ustawienie użytkownika w Pinia store
        }

        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Błąd podczas logowania przez Google:', error);
        this.errorMessage = `Błąd logowania: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },

    // Logowanie przez Email
    async loginWithEmail() {
      this.loading = true;
      const userStore = useUserStore(); // Używamy Pinia store

      try {
        // reCAPTCHA token verification
        const token = await grecaptcha.execute(this.recaptchaSiteKey, { action: 'login' });
        const response = await axios.post('/verify-recaptcha', { token });

        if (!response.data.success) {
          this.errorMessage = 'Weryfikacja reCAPTCHA nie powiodła się.';
          this.loading = false;
          return;
        }

        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userStore.setUser(userData); // Ustawienie użytkownika w Pinia store
          this.$router.push('/dashboard');
        } else {
          console.error('Nie znaleziono dokumentu użytkownika!');
          this.errorMessage = 'Nie znaleziono danych użytkownika.';
        }
      } catch (error) {
        console.error('Błąd podczas logowania:', error);
        this.errorMessage = `Błąd podczas logowania: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f4f8;
  padding: 2rem;
}

.login-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
  transition: all 0.3s ease-in-out;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  border-color: #42b983;
  outline: none;
}

.login-btn {
  background-color: #42b983;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-btn .btn-icon {
  margin-right: 0.5rem;
  width: 20px;
  height: 20px;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.google-login-btn {
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
  transition: background-color 0.3s ease;
}

.google-login-btn .btn-icon {
  width: 20px;
  height: 20px;
}

.google-login-btn:hover {
  background-color: #c53727;
}

.error-message {
  color: red;
  margin-top: 1rem;
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #42b983;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .login-card {
    padding: 1.5rem;
  }
}
</style>


import { defineStore } from 'pinia';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    fcmToken: '', // Token FCM dla powiadomień
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    getUserEmail: (state) => state.user?.email || '',
    getFcmToken: (state) => state.fcmToken,
  },

  actions: {
    // Fetch user data from Firestore based on current authenticated user's UID
    async fetchUserData() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      this.loading = true; // Start loading

      if (currentUser) {
        try {
          const userDoc = doc(db, 'users', currentUser.uid);
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            this.setUser(userSnapshot.data());
          } else {
            this.error = 'Nie znaleziono dokumentu użytkownika.';
          }
        } catch (error) {
          this.error = 'Błąd podczas pobierania danych użytkownika: ' + error.message;
          console.error('Błąd podczas pobierania danych użytkownika:', error);
        } finally {
          this.loading = false; // Stop loading
        }
      }
    },

    // Set user data to the store state
    setUser(userData) {
      this.user = userData;
      this.error = null; // Clear error when user is successfully set
    },

    // Clear the user data from the store state
    clearUser() {
      this.user = null;
    },

    // Log out the user using Firebase Auth
    async logout() {
      const auth = getAuth();
      this.loading = true;

      try {
        await signOut(auth);
        this.clearUser();
        // Replace window.location with proper router navigation if using Vue Router
        window.location.href = '/login'; 
      } catch (error) {
        this.error = 'Błąd podczas wylogowywania: ' + error.message;
        console.error('Błąd podczas wylogowywania:', error);
      } finally {
        this.loading = false;
      }
    },

    // Initialize auth state listener for automatic user session management
    initAuthState() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.fetchUserData();
        } else {
          this.clearUser();
        }
      });
    },

    // Set FCM token for push notifications
    setFcmToken(token) {
      this.fcmToken = token;
    },

    // Clear error state
    clearError() {
      this.error = null;
    },
  },
});

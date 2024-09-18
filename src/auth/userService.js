import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useUserStore } from '@/stores/userStore'; // Upewnij się, że używasz poprawnego store
import { auth, db } from '@/firebase';
import { getMessagingToken } from '@/firebase/notificationService';
import { logError } from '@/logger';

async function fetchUserData(user) {
  const userStore = useUserStore();
  const userRef = doc(db, 'users', user.uid);

  try {
    const docSnapshot = await getDoc(userRef);
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      userStore.setUser(userData); // Ustawienie użytkownika w Pinia store
      return userData;
    } else {
      console.warn(`Nie znaleziono danych użytkownika o UID: ${user.uid}`);
      return null;
    }
  } catch (error) {
    logError('Błąd podczas pobierania danych użytkownika:', error);
    throw new Error('Błąd podczas pobierania danych użytkownika');
  }
}

export async function handleAuthState() {
  const userStore = useUserStore(); // Używamy Pinia store
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userData = await fetchUserData(user);
        if (userData) {
          await getMessagingToken();
        }
      } catch (error) {
        logError('Błąd podczas inicjalizacji stanu autoryzacji:', error);
      }
    } else {
      userStore.clearUser(); // Usunięcie użytkownika w Pinia store
    }
  });
}

<template>
  <div class="admin-dashboard">
    <h1>Panel Administratora</h1>
    <table>
      <thead>
        <tr>
          <th>Imię</th>
          <th>Nazwisko</th>
          <th>Email</th>
          <th>Numer Telefonu</th>
          <th>Rola</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phoneNumber }}</td>
          <td>
            <select v-model="user.permissions" @change="updateUserRole(user)">
              <option value="Pracownik">Pracownik</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/main';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from 'firebase/auth';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      users: []
    };
  },
  methods: {
    // Aktualizacja roli użytkownika
    async updateUserRole(user) {
      console.log("[INFO] Rozpoczynam aktualizację roli użytkownika...", user);

      try {
        const auth = getAuth();
        console.log("[INFO] Bieżący użytkownik:", auth.currentUser);

        await auth.currentUser.reload();  // Upewnij się, że token użytkownika jest aktualny
        const idToken = await auth.currentUser.getIdToken(true);

        console.log("[INFO] Aktualny token użytkownika:", idToken);

        const functions = getFunctions();
        const setRole = httpsCallable(functions, 'setUserRole');

        console.log("[INFO] Wywoływanie funkcji setUserRole z:", { uid: user.id, role: user.permissions });
        const result = await setRole({ uid: user.id, role: user.permissions });

        console.log("[SUCCESS] Wynik aktualizacji roli:", result.data);

        // Aktualizacja dokumentu użytkownika w Firestore
        const userDoc = doc(db, 'users', user.id);
        await updateDoc(userDoc, { permissions: user.permissions });

        console.log("[SUCCESS] Rola użytkownika została zaktualizowana w Firestore:", user);

        this.$toast.add({ severity: 'success', summary: 'Sukces', detail: 'Rola użytkownika została zaktualizowana.', life: 3000 });
      } catch (error) {
        console.error("[ERROR] Błąd przy aktualizacji roli użytkownika:", error);

        if (error.code === 'functions/internal') {
          this.$toast.add({ severity: 'error', summary: 'Błąd', detail: 'Wewnętrzny błąd serwera.', life: 3000 });
        } else {
          this.$toast.add({ severity: 'error', summary: 'Błąd', detail: 'Wystąpił błąd podczas przypisywania roli.', life: 3000 });
        }
      }
    },

    // Nasłuch zmian w kolekcji users
    async listenForUserChanges() {
      console.log("[INFO] Rozpoczynam nasłuch zmian w kolekcji users...");

      const usersRef = collection(db, 'users');
      onSnapshot(usersRef, (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });

        this.users = users;
        console.log("[INFO] Users updated in real-time:", this.users);
      });
    }
  },
  async mounted() {
    console.log("[INFO] Komponent AdminDashboard zamontowany. Rozpoczynam nasłuch zmian w czasie rzeczywistym...");
    
    await this.listenForUserChanges();
  }
};
</script>

<style scoped>
.admin-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 2em;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #4CAF50;
  color: white;
}

td select {
  padding: 5px;
}
</style>

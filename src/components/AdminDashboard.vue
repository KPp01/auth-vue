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
            <td>{{ user.permissions }}</td>
            <td>
              <select v-model="user.permissions" @change="updateUserRole(user)">
                <option value="Pracownik">Pracownik</option>
                <option value="Manager">Szef</option>
                <option value="Administrator">Administrator</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
  import { db } from '@/main';
  
  export default {
    name: 'AdminDashboard',
    data() {
      return {
        users: []
      };
    },
    methods: {
      async fetchUsers() {
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach((doc) => {
          this.users.push({ id: doc.id, ...doc.data() });
        });
      },
      async updateUserRole(user) {
        const userDoc = doc(db, 'users', user.id);
        await updateDoc(userDoc, { permissions: user.permissions });
        this.$toast.add({ severity: 'success', summary: 'Sukces', detail: 'Rola użytkownika została zaktualizowana.', life: 3000 });
      }
    },
    async mounted() {
      await this.fetchUsers();
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
  
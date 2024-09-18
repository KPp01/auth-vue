<template>
  <div class="order-details">
    <label for="order-name">Nazwa Zlecenia</label>
    <input
      type="text"
      id="order-name"
      v-model="details.name"
      class="form-input"
      required
    />
    <span v-if="!details.name && submitted" class="error-message">
      Nazwa zlecenia jest wymagana
    </span>

    <label for="client-selection">Wybierz Klienta</label>
    <select v-model="selectedClient" id="client-selection" class="form-input">
      <option v-for="client in clients" :key="client.id" :value="client.id">
        {{ client.name }}
      </option>
      <option value="new">Dodaj nowego klienta</option>
    </select>

    <!-- Wpisywanie danych nowego klienta -->
    <div v-if="selectedClient === 'new'" class="new-client-form">
      <label for="client-first-name">Imię Klienta</label>
      <input
        type="text"
        id="client-first-name"
        v-model="newClient.firstName"
        class="form-input"
        required
      />

      <label for="client-last-name">Nazwisko Klienta</label>
      <input
        type="text"
        id="client-last-name"
        v-model="newClient.lastName"
        class="form-input"
        required
      />

      <label for="client-address">Adres Klienta</label>
      <input
        type="text"
        id="client-address"
        v-model="newClient.address"
        class="form-input"
        required
      />

      <label for="client-phone">Telefon Klienta</label>
      <input
        type="tel"
        id="client-phone"
        v-model="newClient.phone"
        class="form-input"
        required
      />

      <label for="client-email">Email Klienta</label>
      <input
        type="email"
        id="client-email"
        v-model="newClient.email"
        class="form-input"
        required
      />
    </div>

    <span v-if="!clientIsSelected && submitted" class="error-message">
      Dane klienta są wymagane
    </span>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { collection, addDoc, getDocs } from "firebase/firestore"; // Zakładając, że używasz Firebase

export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const clients = ref([]); // Lista klientów
    const selectedClient = ref(null); // Wybrany klient
    const newClient = ref({ firstName: "", lastName: "", address: "", phone: "", email: "" }); // Dane nowego klienta
    const clientIsSelected = ref(false); // Sprawdzenie, czy klient jest wybrany

    // Funkcja ładowania klientów z bazy danych
    const loadClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients")); // Pobieranie danych z kolekcji "clients"
        clients.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Błąd ładowania klientów: ", error);
      }
    };

    // Dodanie nowego klienta do bazy
    const saveNewClient = async () => {
      try {
        const docRef = await addDoc(collection(db, "clients"), {
          firstName: newClient.value.firstName,
          lastName: newClient.value.lastName,
          address: newClient.value.address,
          phone: newClient.value.phone,
          email: newClient.value.email,
        });
        // Zapisanie ID nowego klienta
        selectedClient.value = docRef.id;
        clients.value.push({ id: docRef.id, ...newClient.value });
      } catch (error) {
        console.error("Błąd dodawania klienta: ", error);
      }
    };

    // Aktualizowanie wybranych danych klienta
    const updateClientData = () => {
      if (selectedClient.value === "new") {
        if (
          newClient.value.firstName &&
          newClient.value.lastName &&
          newClient.value.address &&
          newClient.value.phone &&
          newClient.value.email
        ) {
          saveNewClient(); // Zapis nowego klienta do bazy
        }
      } else if (selectedClient.value) {
        clientIsSelected.value = true;
      }
    };

    onMounted(loadClients); // Ładowanie klientów po załadowaniu komponentu

    return {
      clients,
      selectedClient,
      newClient,
      clientIsSelected,
      updateClientData,
    };
  },
  computed: {
    details: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>

<style scoped>
/* Stylizacja formularza */
.order-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background-color: var(--card-bg-light);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease-in-out;
}

.order-details label {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-color);
}

.form-input {
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  outline: none;
  background-color: var(--input-background-light);
  color: var(--text-light);
  transition: border-color 0.3s, background-color 0.3s, color 0.3s, box-shadow 0.3s;
}

/* Stylizacja dla ciemnego motywu */
[data-theme="dark"] .form-input {
  background-color: var(--input-background-dark);
  color: var(--text-dark);
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.3); /* Zielona poświata na focus */
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.new-client-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .order-details {
    padding: 1rem;
  }

  .form-input {
    font-size: 0.875rem;
  }
}
</style>

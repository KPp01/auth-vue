<template>
  <div class="order-list-container">
    <div class="toolbar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Szukaj zleceń po nazwie, numerze lub kliencie..."
        class="search-input"
      />
    </div>

    <div class="orders-list">
      <h1 class="list-header">Lista Zleceń</h1>
      <transition-group name="fade" tag="table" class="orders-table">
        <thead>
          <tr>
            <th @click="sortTable('orderNumber')">Nr.<i :class="getSortIcon('orderNumber')"></i></th>
            <th @click="sortTable('orderName')">Nazwa<i :class="getSortIcon('orderName')"></i></th>
            <th @click="sortTable('clientData')">Klient<i :class="getSortIcon('clientData')"></i></th>
            <th @click="sortTable('startDate')">Rozpoczęcie<i :class="getSortIcon('startDate')"></i></th>
            <th @click="sortTable('endDate')">Zakończenie<i :class="getSortIcon('endDate')"></i></th>
            <th @click="sortTable('address')">Adres<i :class="getSortIcon('address')"></i></th>
            <th @click="sortTable('status')">Status<i :class="getSortIcon('status')"></i></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" @click="viewOrder(order.id)" class="order-row">
            <td>{{ order.orderNumber }}</td>
            <td>{{ order.orderName }}</td>
            <td>{{ order.clientData }}</td>
            <td>{{ formatDate(order.startDate) }}</td>
            <td>{{ formatDate(order.endDate) }}</td>
            <td>{{ order.address }}</td>
            <td :class="getStatusClass(order.status)">
              <StatusSelector
                :initial-status="order.status"
                :order-id="order.id"
                @status-updated="handleStatusUpdate(order.id, $event)"
              />
            </td>
          </tr>
        </tbody>
      </transition-group>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/main';
import StatusSelector from './StatusSelector.vue';

export default {
  name: 'OrderList',
  components: { StatusSelector },
  setup() {
    const orders = ref([]);
    const searchQuery = ref('');
    const sortKey = ref('');
    const sortDirection = ref(1);

    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        orders.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Błąd pobierania zleceń:', error);
      }
    };

    const filteredOrders = computed(() => {
      return orders.value.filter((order) => {
        const query = searchQuery.value.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.orderName.toLowerCase().includes(query) ||
          order.clientData.toLowerCase().includes(query)
        );
      });
    });

    const sortTable = (key) => {
      if (sortKey.value === key) {
        sortDirection.value *= -1;
      } else {
        sortKey.value = key;
        sortDirection.value = 1;
      }
      orders.value.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        return (aVal > bVal ? 1 : -1) * sortDirection.value;
      });
    };

    const getSortIcon = (key) => {
      if (sortKey.value !== key) return '';
      return sortDirection.value === 1 ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down';
    };

    const formatDate = (date) => {
      const parsedDate = new Date(date);
      return parsedDate.toLocaleDateString();
    };

    const getStatusClass = (status) => {
      return `status-${status.replace(/\s+/g, '-')}`;
    };

    const viewOrder = (orderId) => {
      console.log('Wybrano zlecenie:', orderId);
    };

    onMounted(() => {
      fetchOrders();
    });

    return {
      searchQuery,
      filteredOrders,
      sortTable,
      formatDate,
      getSortIcon,
      getStatusClass,
    };
  },
};
</script>

<style scoped>
/* Ogólne style dla kontenera listy */
.order-list-container {
  padding: 20px;
  background-color: var(--card-bg-light);
  color: var(--text-color);
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}

[data-theme="dark"] .order-list-container {
  background-color: var(--card-bg-dark);
  color: var(--text-dark);
}

/* Stylizacja paska narzędzi */
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

/* Stylizacja input do wyszukiwania */
.search-input {
  padding: 12px;
  width: 350px;
  border-radius: 8px;
  border: 2px solid var(--primary-color);
  background-color: var(--input-bg-light);
  color: var(--text-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

[data-theme="dark"] .search-input {
  background-color: var(--input-bg-dark);
  color: var(--text-dark);
}

/* Stylizacja tabeli */
.orders-table {
  width: 100%;
  border-collapse: collapse;
}

/* Stylizacja nagłówków i komórek tabeli */
th, td {
  padding: 15px;
  text-align: left;
  border: 1px solid var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

[data-theme="dark"] th, [data-theme="dark"] td {
  border: 1px solid var(--text-dark);
}

/* Stylizacja nagłówków */
th {
  background-color: var(--primary-color);
  color: var(--text-light);
}

[data-theme="dark"] th {
  background-color: var(--primary-dark);
  color: var(--text-dark);
}

/* Stylizacja komórek */
td {
  background-color: var(--card-bg-light);
}

[data-theme="dark"] td {
  background-color: var(--card-bg-dark);
}

/* Stylizacja komórek w trybie hover */
.order-row:hover {
  background-color: var(--hover-bg-light);
}

[data-theme="dark"] .order-row:hover {
  background-color: var(--hover-bg-dark);
}

/* Animacja fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Stylizacja dla responsywności */
@media (max-width: 768px) {
  .orders-table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 8px;
  }

  .search-input {
    width: 100%;
  }
}
</style>

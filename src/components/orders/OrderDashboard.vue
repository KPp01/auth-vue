<template>
  <div class="order-dashboard">
    <aside class="dashboard-nav">
      <h2 class="dashboard-title">Panel Zleceń</h2>
      <ul>
        <li @click="setActive('OrderForm')" :class="{ active: activeComponent === 'OrderForm' }">
          <i class="pi pi-plus"></i> Dodaj Zlecenie
        </li>
        <li @click="setActive('OrdersList')" :class="{ active: activeComponent === 'OrdersList' }">
          <i class="pi pi-list"></i> Lista Zleceń
        </li>
        <li @click="setActive('OrderDetails')" :class="{ active: activeComponent === 'OrderDetails' }">
          <i class="pi pi-info-circle"></i> Szczegóły Zlecenia
        </li>
        <li @click="setActive('OrderTasks')" :class="{ active: activeComponent === 'OrderTasks' }">
          <i class="pi pi-tasks"></i> Zadania
        </li>
        <li @click="setActive('OrderEmployees')" :class="{ active: activeComponent === 'OrderEmployees' }">
          <i class="pi pi-users"></i> Pracownicy
        </li>
        <li @click="setActive('OrderMaterials')" :class="{ active: activeComponent === 'OrderMaterials' }">
          <i class="pi pi-box"></i> Materiały
        </li>
        <li @click="setActive('OrderTools')" :class="{ active: activeComponent === 'OrderTools' }">
          <i class="pi pi-wrench"></i> Narzędzia
        </li>
        <li @click="setActive('OrderLocation')" :class="{ active: activeComponent === 'OrderLocation' }">
          <i class="pi pi-map-marker"></i> Lokalizacja
        </li>
        <li @click="setActive('OrderAttachments')" :class="{ active: activeComponent === 'OrderAttachments' }">
          <i class="pi pi-paperclip"></i> Załączniki
        </li>
        <li @click="setActive('OrderRemarks')" :class="{ active: activeComponent === 'OrderRemarks' }">
          <i class="pi pi-comment"></i> Uwagi
        </li>
      </ul>
    </aside>

    <section class="dashboard-content">
      <transition name="slide-fade" mode="out-in">
        <component :is="activeComponent" key="activeComponent"></component>
      </transition>
    </section>
  </div>
</template>

<script>
import OrderForm from '@/components/orders/OrderForm.vue';
import OrdersList from '@/components/orders/OrdersList.vue';
import OrderDetails from '@/components/orders/OrderDetails.vue';
import OrderTasks from '@/components/orders/OrderTasks.vue';
import OrderEmployees from '@/components/orders/OrderEmployees.vue';
import OrderMaterials from '@/components/orders/OrderMaterials.vue';
import OrderTools from '@/components/orders/OrderTools.vue';
import OrderLocation from '@/components/orders/OrderLocation.vue';
import OrderAttachments from '@/components/orders/OrderAttachments.vue';
import OrderRemarks from '@/components/orders/OrderRemarks.vue';

export default {
  data() {
    return {
      activeComponent: localStorage.getItem('lastActiveComponent') || 'OrderForm',
    };
  },
  components: {
    OrderForm,
    OrdersList,
    OrderDetails,
    OrderTasks,
    OrderEmployees,
    OrderMaterials,
    OrderTools,
    OrderLocation,
    OrderAttachments,
    OrderRemarks,
  },
  methods: {
    setActive(component) {
      this.activeComponent = component;
      localStorage.setItem('lastActiveComponent', component);
    },
  },
};
</script>

<style scoped>
.order-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: var(--background-light);
  font-family: var(--font-family);
}

/* Nawigacja po lewej stronie */
.dashboard-nav {
  width: 260px;
  background-color: var(--navbar-bg-color);
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.dashboard-title {
  font-size: 1.8rem;
  color: var(--text-color);
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
  border-bottom: 2px solid var(--text-color);
}

ul {
  padding: 0;
  list-style: none;
}

li {
  padding: 12px 15px;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

li:hover {
  background-color: var(--hover-bg-color);
}

li.active {
  background-color: var(--primary-bg-color);
}

.dashboard-content {
  flex: 1;
  padding: 20px;
  background-color: var(--card-bg-light);
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

@media (max-width: 768px) {
  .dashboard-nav {
    width: 100%;
    padding: 15px;
  }

  .dashboard-content {
    padding: 10px;
  }
}
</style>

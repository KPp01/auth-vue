<template>
  <div class="order-form-container">
    <h1 class="form-title">Dodaj Zlecenie</h1>
    <form @submit.prevent="submitOrder" class="order-form">
      <OrderNumber :orderNumber="orderNumber" />
      <OrderDetails v-model="orderDetails" :submitted="submitted" />
      <OrderEmployees v-model="employees" />
      <OrderLocation v-model="location" />
      <OrderTasks v-model="tasks" :submitted="submitted" />
      <OrderMaterials v-model="materials" />
      <OrderTools v-model="tools" />
      <OrderAttachments v-model="attachments" />
      <OrderRemarks v-model:remarks="remarks" />
      <button type="submit" class="submit-btn">Zatwierdź Zlecenie</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import OrderNumber from './OrderNumber.vue';
import OrderDetails from './OrderDetails.vue';
import OrderEmployees from './OrderEmployees.vue';
import OrderLocation from './OrderLocation.vue';
import OrderTasks from './OrderTasks.vue';
import OrderMaterials from './OrderMaterials.vue';
import OrderTools from './OrderTools.vue';
import OrderAttachments from './OrderAttachments.vue';
import OrderRemarks from './OrderRemarks.vue';
import { validateOrder } from '@/modules/orders/orderValidation';
import orderService from '@/modules/orders/orderService';

export default {
  components: {
    OrderNumber,
    OrderDetails,
    OrderEmployees,
    OrderLocation,
    OrderTasks,
    OrderMaterials,
    OrderTools,
    OrderAttachments,
    OrderRemarks,
  },
  setup() {
    const orderNumber = ref('2024/007');
    const orderDetails = ref({});
    const employees = ref([]);
    const location = ref({
      address: '',
      pins: [],
    });
    const tasks = ref([]);
    const materials = ref([]);
    const tools = ref([]);
    const attachments = ref([]);
    const remarks = ref('');
    const submitted = ref(false);

    const submitOrder = async () => {
      submitted.value = true;
      const order = {
        orderNumber: orderNumber.value,
        orderDetails: orderDetails.value,
        employees: employees.value,
        location: location.value,
        tasks: tasks.value,
        materials: materials.value,
        tools: tools.value,
        attachments: attachments.value,
        remarks: remarks.value,
      };

      const validationResult = validateOrder(order);
      if (validationResult.isValid) {
        try {
          await orderService.saveOrder(order);
          alert('Zlecenie zostało pomyślnie dodane!');
        } catch (error) {
          console.error('Błąd podczas zapisu zlecenia:', error);
        }
      } else {
        console.error('Błędy walidacji:', validationResult.errors);
      }
    };

    return {
      orderNumber,
      orderDetails,
      employees,
      location,
      tasks,
      materials,
      tools,
      attachments,
      remarks,
      submitted,
      submitOrder,
    };
  },
};
</script>

<style scoped>
.order-form-container {
  padding: 20px;
  background-color: var(--card-bg-light);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease-in-out;
}

.form-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8rem;
  color: var(--primary-color);
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

input,
textarea,
button {
  font-size: 1rem;
  padding: 0.75rem;
  border: 2px solid var(--primary-color);
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s, background-color 0.3s;
}

input:focus,
textarea:focus {
  border-color: var(--primary-hover-color);
}

button {
  background-color: var(--button-bg-light);
  color: var(--button-text-color);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: var(--primary-hover-color);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .order-form {
    padding: 1rem;
  }

  button {
    width: 100%;
    padding: 1rem;
  }
}
</style>

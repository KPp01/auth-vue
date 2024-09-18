<template>
  <div class="order-number">
    <label for="order-number">Numer Zlecenia</label>
    <input type="text" id="order-number" :value="orderNumber" disabled class="order-number-input" />
  </div>
</template>

<script>
export default {
  props: {
    orderNumber: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
.order-number {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.order-number-input {
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.order-number-input:disabled {
  color: #666;
  background-color: #e9e9e9;
}
</style>

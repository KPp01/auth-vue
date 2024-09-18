<template>
  <div class="order-employees">
    <label for="employees">Osoby Realizujące</label>
    <input type="text" id="employees" v-model="employees" />
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Array,
      required: true
    }
  },
  computed: {
    employees: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  }
};
</script>

<style scoped>
.order-employees {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.order-employees input {
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 5px;
}
</style>

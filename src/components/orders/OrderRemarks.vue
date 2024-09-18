<template>
  <div class="order-remarks">
    <h3>Uwagi Pracodawcy</h3>
    <textarea :value="remarks" @input="onInput" rows="3" placeholder="Wprowadź uwagi"></textarea>
  </div>
</template>

<script>
export default {
  props: {
    remarks: {
      type: String,
      required: true
    }
  },
  methods: {
    // Emitujemy zdarzenie `update:modelValue` zgodnie z zaleceniami Vue 3
    onInput(event) {
      this.$emit('update:remarks', event.target.value);
    }
  }
};
</script>

<style scoped>
.order-remarks {
  margin-bottom: 1.5rem;
}

textarea {
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
}
</style>

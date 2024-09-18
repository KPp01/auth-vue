<template>
  <div class="order-materials">
    <h3>Materiały</h3>
    <div v-for="(material, index) in materials" :key="index" class="material-item">
      <textarea
        v-model="materials[index]"
        rows="2"
        class="material-input"
        :placeholder="'Materiał ' + (index + 1)"
      ></textarea>
      <button @click="removeMaterial(index)" class="remove-btn">
        <i class="pi pi-trash"></i> Usuń
      </button>
    </div>
    <button @click="addMaterial" class="add-btn">
      <i class="pi pi-plus"></i> Dodaj Materiał
    </button>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: Array,
  },
  computed: {
    materials: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  methods: {
    addMaterial() {
      this.materials.push('');
    },
    removeMaterial(index) {
      this.materials.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.order-materials {
  background: var(--card-bg-light);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: var(--box-shadow);
  margin-bottom: 1.5rem;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.material-input {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.material-input:focus {
  border-color: var(--primary-hover-color);
  box-shadow: 0 0 10px var(--primary-hover-color);
}

.add-btn,
.remove-btn {
  padding: 0.75rem 1.25rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.add-btn i,
.remove-btn i {
  margin-right: 0.5rem;
}

.add-btn:hover,
.remove-btn:hover {
  background-color: var(--primary-hover-color);
  transform: scale(1.05);
}
</style>

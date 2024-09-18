<template>
  <div class="order-attachments">
    <h3>Załączniki</h3>
    <div v-for="(file, index) in files" :key="index" class="file-item">
      <input type="file" @change="onFileSelected($event, index)" class="file-input" />
      <button @click="removeFile(index)" class="remove-btn">
        <i class="pi pi-trash"></i> Usuń
      </button>
    </div>
    <button @click="addFile" class="add-btn">
      <i class="pi pi-plus"></i> Dodaj Załącznik
    </button>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: Array,
  },
  computed: {
    files: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  methods: {
    onFileSelected(event, index) {
      const file = event.target.files[0];
      this.$emit('file-selected', { file, index });
    },
    addFile() {
      this.files.push({ file: null });
    },
    removeFile(index) {
      this.files.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.order-attachments {
  background: var(--card-bg-light);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: var(--box-shadow);
  margin-bottom: 1.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.file-input {
  flex: 1;
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

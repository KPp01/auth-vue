<template>
  <div class="order-tools">
    <h3>Narzędzia</h3>
    <draggable v-model="tools" group="tools" class="tools-list">
      <div v-for="(tool, index) in tools" :key="index" class="tool-item">
        <textarea v-model="tools[index]" rows="2" class="tool-textarea"></textarea>
        <button @click="removeTool(index)" class="remove-tool-btn">Usuń</button>
      </div>
    </draggable>
    <button @click="addTool" class="add-tool-btn">Dodaj Narzędzie</button>
  </div>
</template>

<script>
import draggable from 'vuedraggable';

export default {
  components: {
    draggable
  },
  props: {
    modelValue: Array
  },
  computed: {
    tools: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    addTool() {
      this.tools.push('');
    },
    removeTool(index) {
      this.tools.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.order-tools {
  margin-bottom: 1.5rem;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tool-textarea {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--primary-color);
  border-radius: 5px;
}

.add-tool-btn, .remove-tool-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-tool-btn:hover, .remove-tool-btn:hover {
  background-color: var(--primary-hover-color);
}
</style>

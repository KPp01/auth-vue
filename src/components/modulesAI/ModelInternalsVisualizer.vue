<template> 
  <div class="model-internals-visualizer">
    <h3>Model Internals Visualizer</h3>
    <div v-if="internalState">
      <div v-for="(value, key) in internalState" :key="key" class="internal-item">
        <strong>{{ key }}:</strong> <span>{{ formatValue(value) }}</span>
      </div>
    </div>
    <div v-else>
      <p>No internal state data available.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModelInternalsVisualizer',
  props: {
    internalState: {
      type: Object,
      required: true // Ensure internalState is passed
    }
  },
  methods: {
    // Helper method to format values in a user-friendly way
    formatValue(value) {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2); // Pretty-print objects and arrays
      }
      return value;
    }
  }
};
</script>

<style scoped>
.model-internals-visualizer {
  padding: 20px;
  background-color: var(--surface-a);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

h3 {
  margin-bottom: 15px;
  color: var(--text-color);
}

.internal-item {
  margin-bottom: 10px;
}

.internal-item strong {
  color: var(--text-color-secondary);
}
</style>

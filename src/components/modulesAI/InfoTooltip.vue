<template>
  <span class="info-tooltip">
    <i class="pi pi-info-circle" v-tooltip.bottom="text"></i>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import Tooltip from 'primevue/tooltip';

export default defineComponent({
  name: 'InfoTooltip',
  directives: {
    tooltip: Tooltip
  },
  props: {
    text: {
      type: String,
      required: true
    }
  }
});
</script>

<style scoped>
.info-tooltip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 5px;
  cursor: help;
}

.info-tooltip i {
  font-size: 16px;
  color: var(--text-color);
}

:deep(.p-tooltip .p-tooltip-text) {
  background-color: var(--card-bg-dark);
  color: var(--text-dark);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>

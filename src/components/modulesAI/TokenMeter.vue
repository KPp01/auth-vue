<template>
    <div class="token-meter">
      <ProgressBar :value="percentage" :showValue="false" />
      <div class="token-info">
        <span>{{ usedTokens }} / {{ maxTokens }} tokens</span>
        <span>{{ percentage.toFixed(1) }}%</span>
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent, computed } from 'vue';
  import ProgressBar from 'primevue/progressbar';
  
  export default defineComponent({
    name: 'TokenMeter',
    components: {
      ProgressBar
    },
    props: {
      usedTokens: {
        type: Number,
        required: true
      },
      maxTokens: {
        type: Number,
        required: true
      }
    },
    setup(props) {
      const percentage = computed(() => {
        if (props.maxTokens === 0) return 0; // Ochrona przed dzieleniem przez zero
        return (props.usedTokens / props.maxTokens) * 100;
      });
  
      return {
        percentage
      };
    }
  });
  </script>
  
  <style scoped>
  .token-meter {
    width: 100%;
  }
  
  .token-info {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-color);
  }
  
  :deep(.p-progressbar) {
    height: 0.5rem;
  }
  
  :deep(.p-progressbar-value) {
    background-color: var(--primary-color);
  }
  </style>
  
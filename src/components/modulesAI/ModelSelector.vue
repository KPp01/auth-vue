<template>
  <div class="model-selector" :class="{ 'dark-mode': isDarkMode }">
    <h3>{{ $t('modelSelector.title') }}</h3>

    <!-- Ładowanie modeli -->
    <div v-if="loading" class="loading-overlay">
      <ProgressSpinner />
    </div>

    <!-- Obsługa błędów -->
    <div v-else-if="error" class="error-message">
      {{ error }}
      <Button :label="$t('common.retry')" icon="pi pi-refresh" @click="retryFetch" />
    </div>

    <!-- Lista modeli -->
    <div v-else class="model-list">
      <TransitionGroup name="model-list" tag="div">
        <div v-for="model in sortedModels" :key="model.id" class="model-item"
             :class="{ 'selected': model.id === modelValue }"
             @click="selectModel(model.id)"
             :aria-selected="model.id === modelValue"
             tabindex="0"
             @keydown.enter="selectModel(model.id)"
             role="option">
          <div class="model-icon" :style="{ backgroundColor: model.color }" aria-hidden="true">
            {{ model.icon }}
          </div>
          <div class="model-info">
            <h4>{{ model.name }}</h4>
            <p>{{ model.description }}</p>
            <div class="model-stats">
              <span>{{ $t('modelSelector.tokens', { count: formatNumber(model.maxTokens) }) }}</span>
              <span>{{ $t('modelSelector.speed', { speed: model.speed }) }}</span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Porównanie modeli -->
    <div class="model-comparison">
      <Button @click="toggleComparison" :label="showComparison ? $t('modelSelector.hideComparison') : $t('modelSelector.showComparison')" />
    </div>
    <Modal v-model="showComparison" :title="$t('modelSelector.comparisonTitle')">
      <ComparisonTable :models="sortedModels" />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useModelStore } from '@/stores/modelStore';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Modal from '@/components/Modal.vue';
import ComparisonTable from './ComparisonTable.vue';
import { formatNumber } from '@/utils/formatters';

export default {
name: 'ModelSelector',
components: {
  Button,
  ProgressSpinner,
  Modal,
  ComparisonTable
},
props: {
  modelValue: {
    type: String,
    required: true
  }
},
emits: ['update:modelValue'],
setup(props, { emit }) {
  const { t } = useI18n();
  const modelStore = useModelStore();
  const { sortedModels, loading, error } = storeToRefs(modelStore);
  const showComparison = ref(false);

  // Wybór modelu
  const selectModel = (modelId) => {
    modelStore.setSelectedModel(modelId);
    emit('update:modelValue', modelId);
  };

  // Przełącznik wyświetlania porównania
  const toggleComparison = () => {
    showComparison.value = !showComparison.value;
  };

  // Retry przy błędzie
  const retryFetch = () => {
    modelStore.fetchModels(true);
  };

  // Obsługa zmian propsów
  watch(() => props.modelValue, (newValue) => {
    if (newValue !== modelStore.selectedModelId) {
      modelStore.setSelectedModel(newValue);
    }
  });

  // Montowanie komponentu i pobieranie modeli
  onMounted(async () => {
    if (sortedModels.value.length === 0) {
      await modelStore.fetchModels();
    }
    if (props.modelValue && !modelStore.selectedModelId) {
      modelStore.setSelectedModel(props.modelValue);
    }
  });

  return {
    sortedModels,
    loading,
    error,
    showComparison,
    selectModel,
    toggleComparison,
    retryFetch,
    formatNumber,
    t
  };
}
};
</script>

<style scoped>
.model-selector {
background: var(--surface-a);
border-radius: 12px;
padding: 20px;
box-shadow: var(--card-shadow);
position: relative;
}

.model-list {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 20px;
margin-bottom: 20px;
}

.model-item {
background: var(--surface-b);
border-radius: 8px;
padding: 15px;
cursor: pointer;
transition: all 0.3s ease;
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
}

.model-item:hover,
.model-item.selected {
transform: translateY(-5px);
box-shadow: var(--card-shadow);
}

.model-icon {
width: 50px;
height: 50px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 24px;
margin-bottom: 10px;
}

.model-info h4 {
margin: 0 0 10px 0;
color: var(--text-color);
}

.model-info p {
color: var(--text-color-secondary);
}

.model-stats {
display: flex;
justify-content: space-around;
margin-top: 10px;
font-size: 0.9em;
color: var(--text-color-secondary);
}

.loading-overlay {
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(255, 255, 255, 0.7);
display: flex;
justify-content: center;
align-items: center;
z-index: 1;
}

.error-message {
color: var(--error-color);
text-align: center;
padding: 20px;
}

.model-list-enter-active,
.model-list-leave-active {
transition: all 0.5s ease;
}

.model-list-enter-from,
.model-list-leave-to {
opacity: 0;
transform: translateY(30px);
}

@media (max-width: 768px) {
.model-list {
  grid-template-columns: 1fr;
}
}
</style>

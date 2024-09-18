import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useModelStore = defineStore('model', () => {
  const models = ref([]);
  const selectedModelId = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const lastFetch = ref(null);

  const API_URL = 'https://api.example.com/ai-models'; // Zastąp prawdziwym URL API
  const CACHE_TIME = 5 * 60 * 1000; // 5 minut

  const sortedModels = computed(() => {
    return [...models.value].sort((a, b) => b.maxTokens - a.maxTokens);
  });

  const selectedModel = computed(() => {
    return models.value.find(model => model.id === selectedModelId.value);
  });

  const getModelById = computed(() => {
    return (id) => models.value.find(model => model.id === id);
  });

  async function fetchModels(force = false) {
    if (!force && lastFetch.value && Date.now() - lastFetch.value < CACHE_TIME) {
      console.log('Using cached model data');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(API_URL);
      models.value = response.data.map(model => ({
        ...model,
        color: model.color || getRandomColor(),
        icon: model.icon || '🤖'
      }));
      lastFetch.value = Date.now();
    } catch (e) {
      console.error('Error fetching models:', e);
      error.value = 'Failed to fetch models. Please try again later.';
    } finally {
      loading.value = false;
    }
  }

  function setSelectedModel(modelId) {
    const model = getModelById.value(modelId);
    if (model) {
      selectedModelId.value = modelId;
    } else {
      console.warn(`Model with id ${modelId} not found`);
    }
  }

  function addModel(model) {
    if (!models.value.some(m => m.id === model.id)) {
      models.value.push({
        ...model,
        color: model.color || getRandomColor(),
        icon: model.icon || '🤖'
      });
    }
  }

  function updateModel(updatedModel) {
    const index = models.value.findIndex(model => model.id === updatedModel.id);
    if (index !== -1) {
      models.value[index] = { ...models.value[index], ...updatedModel };
    }
  }

  function removeModel(modelId) {
    const index = models.value.findIndex(model => model.id === modelId);
    if (index !== -1) {
      models.value.splice(index, 1);
      if (selectedModelId.value === modelId) {
        selectedModelId.value = models.value[0]?.id || null;
      }
    }
  }

  function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  return {
    models,
    sortedModels,
    selectedModel,
    selectedModelId,
    loading,
    error,
    getModelById,
    fetchModels,
    setSelectedModel,
    addModel,
    updateModel,
    removeModel
  };
});
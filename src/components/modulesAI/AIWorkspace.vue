<template>
    <div class="ai-workspace">
      <CommandCreator @command-created="processCommand" :isProcessing="isProcessing" />
      <ModelSelector v-model="selectedModel" :availableModels="availableModels" />
      <ResponseViewer :response="aiResponse" :isError="isError" :processingTime="processingTime" />
      <AIDebugger :debugInfo="debugInfo" v-if="showDebugger" />
      <ThreadManager :currentThread="currentThread" @thread-changed="changeThread" :threads="threads" />
      <ExportManager :data="exportData" @export-complete="handleExportComplete" />
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useAIStore } from '@/stores/aiStore';
  import CommandCreator from './CommandCreator.vue';
  import ModelSelector from './ModelSelector.vue';
  import ResponseViewer from './ResponseViewer.vue';
  import AIDebugger from './AIDebugger.vue';
  import ThreadManager from './ThreadManager.vue';
  import ExportManager from './ExportManager.vue';
  import { processAICommand } from '@/services/AIService';
  import { logError } from '@/utils/errorLogger';
  
  export default {
    name: 'AIWorkspace',
    components: {
      CommandCreator,
      ModelSelector,
      ResponseViewer,
      AIDebugger,
      ThreadManager,
      ExportManager,
    },
    setup() {
      const aiStore = useAIStore();
      const selectedModel = ref('gpt-4');
      const aiResponse = ref(null);
      const debugInfo = ref({});
      const currentThread = ref(null);
      const exportData = ref({});
      const isProcessing = ref(false);
      const isError = ref(false);
      const processingTime = ref(0);
      const showDebugger = ref(false);
  
      const availableModels = computed(() => aiStore.availableModels);
      const threads = computed(() => aiStore.threads);
  
      onMounted(async () => {
        try {
          await aiStore.fetchAvailableModels();
        } catch (error) {
          logError('Failed to fetch available models', error);
        }
      });
  
      const processCommand = async (command) => {
        if (isProcessing.value) return; // Uniknięcie ponownego wywołania w trakcie przetwarzania
  
        isProcessing.value = true;
        isError.value = false;
        const startTime = performance.now();
  
        try {
          if (!command) return; // Uniknięcie pustego wywołania
  
          const result = await processAICommand(command, selectedModel.value);
          aiResponse.value = result.response;
          debugInfo.value = result.debugInfo;
          exportData.value = { command, response: aiResponse.value };
          aiStore.addToHistory({ command, response: aiResponse.value, model: selectedModel.value });
        } catch (error) {
          isError.value = true;
          aiResponse.value = "An error occurred while processing your request.";
          logError('Error processing command', error);
        } finally {
          isProcessing.value = false;
          processingTime.value = performance.now() - startTime;
        }
      };
  
      const changeThread = (thread) => {
        if (currentThread.value === thread) return; // Uniknięcie wielokrotnego przełączania na ten sam wątek
        currentThread.value = thread;
        aiStore.loadThread(thread.id);
      };
  
      const handleExportComplete = (exportedData) => {
        console.log('Export completed', exportedData);
      };
  
      return {
        selectedModel,
        aiResponse,
        debugInfo,
        currentThread,
        exportData,
        isProcessing,
        isError,
        processingTime,
        showDebugger,
        availableModels,
        threads,
        processCommand,
        changeThread,
        handleExportComplete,
      };
    },
  };
  </script>
  
  <style scoped>
  .ai-workspace {
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-template-rows: auto auto 1fr auto;
    gap: 20px;
    padding: 20px;
    height: 100vh;
    box-sizing: border-box;
  }
  
  @media (max-width: 768px) {
    .ai-workspace {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
    }
  }
  </style>
  
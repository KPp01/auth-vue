<template>
    <div class="ai-debugger">
      <h3>AI Debugger <span class="version">v2.1</span></h3>
      <div class="debug-controls">
        <button @click="toggleDebugger" :class="{ active: isActive }">
          {{ isActive ? 'Deactivate' : 'Activate' }} Debugger
        </button>
        <select v-model="debugLevel" :disabled="!isActive">
          <option value="basic">Basic</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
      </div>
      <div v-if="isActive" class="debug-content">
        <div class="debug-section">
          <h4>Token Usage
            <InfoTooltip text="Shows the number of tokens used in the request and response." />
          </h4>
          <TokenMeter :usedTokens="debugInfo.tokenUsage.total" :maxTokens="debugInfo.tokenUsage.max" />
        </div>
        <div class="debug-section">
          <h4>Response Time
            <InfoTooltip text="Time taken for the AI to generate a response." />
          </h4>
          <ResponseTimeGraph :responseTimes="debugInfo.responseTimes" />
        </div>
        <div v-if="showModelInternals" class="debug-section">
          <h4>Model Internals
            <InfoTooltip text="Internal state and decision process of the AI model." />
          </h4>
          <ModelInternalsVisualizer :internalState="debugInfo.modelInternals" />
        </div>
        <div v-if="showNeuralActivations" class="debug-section">
          <h4>Neural Network Activation
            <InfoTooltip text="Visual representation of neural network activations." />
          </h4>
          <NeuralNetworkVisualizer :activations="debugInfo.neuralActivations" />
        </div>
        <div class="debug-section">
          <h4>Error Log
            <InfoTooltip text="Log of errors and warnings encountered during processing." />
          </h4>
          <ErrorLog :errors="debugInfo.errors" :warnings="debugInfo.warnings" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, watch } from 'vue';
  import InfoTooltip from './InfoTooltip.vue';
  import TokenMeter from './TokenMeter.vue';
  import ResponseTimeGraph from './ResponseTimeGraph.vue';
  import ModelInternalsVisualizer from './ModelInternalsVisualizer.vue';
  import NeuralNetworkVisualizer from './NeuralNetworkVisualizer.vue';
  import ErrorLog from './ErrorLog.vue';
  
  export default {
    name: 'AIDebugger',
    components: {
      InfoTooltip,
      TokenMeter,
      ResponseTimeGraph,
      ModelInternalsVisualizer,
      NeuralNetworkVisualizer,
      ErrorLog
    },
    props: {
      debugInfo: {
        type: Object,
        required: true
      }
    },
    setup(props) {
      const isActive = ref(false); // Przechowuje stan aktywacji debuggera
      const debugLevel = ref('basic'); // Przechowuje aktualny poziom debugowania
      const showModelInternals = computed(() => debugLevel.value === 'advanced' || debugLevel.value === 'expert'); // Wybór widoku wewnętrznego stanu modelu
      const showNeuralActivations = computed(() => debugLevel.value === 'expert'); // Pokazuje wizualizację aktywacji sieci neuronowej tylko na poziomie 'expert'
  
      // Funkcja odpowiedzialna za aktywowanie/dezaktywowanie debuggera
      const toggleDebugger = () => {
        isActive.value = !isActive.value;
        console.log(`AI Debugger ${isActive.value ? 'activated' : 'deactivated'}`);
      };
  
      // Watcher, który monitoruje zmiany poziomu debugowania
      watch(debugLevel, (newLevel) => {
        console.log(`Debug level changed to: ${newLevel}`);
      });
  
      return {
        isActive,
        debugLevel,
        toggleDebugger,
        showModelInternals,
        showNeuralActivations
      };
    }
  };
  </script>
  
  <style scoped>
  .ai-debugger {
    background: #1e1e1e;
    color: #e0e0e0;
    padding: 20px;
    border-radius: 10px;
    font-family: 'Courier New', monospace;
  }
  
  .version {
    font-size: 0.8em;
    color: #00ff00;
    margin-left: 10px;
  }
  
  .debug-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  button,
  select {
    background: #333;
    color: #fff;
    border: 1px solid #555;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  button:hover,
  select:hover {
    background: #444;
  }
  
  button.active {
    background: #00ff00;
    color: #000;
  }
  
  .debug-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .debug-section {
    background: #2a2a2a;
    padding: 15px;
    border-radius: 8px;
  }
  
  h4 {
    color: #00ff00;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
  </style>
  
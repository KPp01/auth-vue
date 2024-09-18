<template>
  <div class="dashboard-ai">
    <h1>{{ $t('aiDashboard.title') }}</h1>
    <p>{{ $t('aiDashboard.description') }}</p>

    <div class="dashboard-content">
      <div class="main-panel">
        <ModelSelector v-model="selectedModel" @update:model-value="handleModelChange" />

        <CommandInput
          v-model="command"
          :maxTokens="maxTokens"
          :temperature="temperature"
          @update:max-tokens="maxTokens = $event"
          @update:temperature="temperature = $event"
          @submit="sendCommand"
        />

        <Button
          :label="isProcessing ? $t('aiDashboard.processing') : $t('aiDashboard.generateResponse')"
          @click="sendCommand"
          :disabled="!command || isProcessing"
          :loading="isProcessing"
          class="send-button p-button-primary"
        />

        <ResponseViewer
          v-if="response"
          :response="response"
          :model="selectedModel"
          @copy="copyToClipboard"
        />

        <ResponseEvaluator
          v-if="response"
          :response="response"
          :originalQuery="command"
          @evaluation-complete="handleResponseEvaluation"
        />

        <ResponseComparator
          v-if="previousResponse"
          :responseA="previousResponse"
          :responseB="response"
        />

        <ResponseFormatter
          v-if="response"
          :response="response"
          @format-changed="handleFormatChange"
        />

        <SemanticAnalyzer
          v-if="response"
          :text="response"
          @analysis-complete="handleSemanticAnalysis"
        />
      </div>

      <div class="side-panel">
        <ResponseTimeline :responseEvents="responseEvents" />

        <InteractiveExamples
          :initialExamples="interactiveExamples"
          @example-run="handleExampleRun"
        />

        <CommandHistory
          :history="history"
          @clear-history="clearCommandHistory"
          @select-command="selectHistoricalCommand"
        />

        <HistoryAnalysis :analysisData="historyAnalysis" />

        <ExportManager
          :data="exportData"
          @export-complete="handleExportComplete"
        />
      </div>
    </div>

    <LanguageTranslator
      v-if="response"
      :text="response"
      @translation-complete="handleTranslation"
    />

    <TextToSpeech
      v-if="response"
      :text="response"
      @speech-complete="handleSpeechSynthesis"
    />

    <AIDebugger :debugInfo="debugInfo" />

    <Toast />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAIStore } from '@/stores/aiStore';
import { useThreadStore } from '@/stores/threadStore';
import { useTranslationStore } from '@/stores/translationStore';
import { useTextToSpeechStore } from '@/stores/textToSpeechStore';
import { useNotificationStore } from '@/stores/notificationStore';
import ModelSelector from '@/components/modulesAI/ModelSelector.vue';
import CommandInput from '@/components/modulesAI/CommandInput.vue';
import ResponseViewer from '@/components/modulesAI/ResponseViewer.vue';
import '@/components/modulesAI/ResponseEvaluator.js';
import ResponseComparator from '@/components/modulesAI/ResponseComparator.vue';
import '@/components/modulesAI/CommandHistory.js';
import HistoryAnalysis from '@/components/modulesAI/HistoryAnalysis.vue';
import '@/components/modulesAI/ExportManager.js';
import LanguageTranslator from '@/components/modulesAI/LanguageTranslator.vue';
import TextToSpeech from '@/components/modulesAI/TextToSpeech.vue';
import AIDebugger from '@/components/modulesAI/AIDebugger.vue';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

export default {
  name: 'DashboardAi',
  components: {
    ModelSelector,
    CommandInput,
    ResponseViewer,
    ResponseComparator,
    HistoryAnalysis,
    LanguageTranslator,
    TextToSpeech,
    AIDebugger,
    Button,
    Toast,
  },
  setup() {
    const { t } = useI18n();
    const toast = useToast();
    const aiStore = useAIStore();
    const threadStore = useThreadStore();
    const translationStore = useTranslationStore();
    const ttsStore = useTextToSpeechStore();
    const notificationStore = useNotificationStore();

    const command = ref('');
    const response = ref('');
    const previousResponse = ref('');
    const maxTokens = ref(1000);
    const temperature = ref(0.7);
    const responseEvents = ref([]);
    const interactiveExamples = ref([]);
    const debugInfo = ref({});
    const isProcessing = ref(false);

    const selectedModel = computed(() => aiStore.selectedModel);
    const history = computed(() => threadStore.currentThread?.messages || []);
    const historyAnalysis = computed(() => aiStore.analyzeConversationTrends());
    const exportData = computed(() => ({
      command: command.value,
      response: response.value,
      model: selectedModel.value,
      timestamp: new Date().toISOString(),
    }));

    return {
      command,
      response,
      previousResponse,
      maxTokens,
      temperature,
      responseEvents,
      interactiveExamples,
      debugInfo,
      isProcessing,
      selectedModel,
      history,
      historyAnalysis,
      exportData,
      copyToClipboard,
      debouncedSendCommand,
      clearCommandHistory,
      selectHistoricalCommand,
      handleModelChange,
      handleEvaluation,
      handleResponseEvaluation,
      handleFormatChange,
      handleSemanticAnalysis,
      handleExportComplete,
      handleTranslation,
      handleSpeechSynthesis,
      handleExampleRun,
    };
  },
};
</script>

<style scoped>
.dashboard-ai {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-panel,
.side-panel {
  padding: 1rem;
}

.send-button {
  margin-top: 1rem;
}
</style>

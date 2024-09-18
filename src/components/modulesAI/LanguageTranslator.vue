<template>
  <div class="language-translator">
    <div class="translator-header">
      <h3>AI-Powered Language Translator</h3>
      <LanguageSelector v-model="sourceLanguage" label="From" />
      <button @click="swapLanguages" class="swap-btn">
        <i class="fas fa-exchange-alt"></i>
      </button>
      <LanguageSelector v-model="targetLanguage" label="To" />
    </div>

    <div class="translator-body">
      <div class="input-section">
        <textarea
          v-model="sourceText"
          @input="handleInput"
          placeholder="Enter text to translate"
          :disabled="isTranslating"
        ></textarea>
        <div class="text-controls">
          <button @click="clearText" :disabled="!sourceText">Clear</button>
          <button @click="pasteText" :disabled="isTranslating">Paste</button>
          <button @click="speakText(sourceText, sourceLanguage)" :disabled="!sourceText">
            <i class="fas fa-volume-up"></i>
          </button>
        </div>
      </div>

      <div class="output-section">
        <div class="translation-result" v-if="translatedText">
          {{ translatedText }}
        </div>
        <div class="placeholder" v-else>
          Translation will appear here
        </div>
        <div class="text-controls">
          <button @click="copyTranslation" :disabled="!translatedText">Copy</button>
          <button @click="speakText(translatedText, targetLanguage)" :disabled="!translatedText">
            <i class="fas fa-volume-up"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="translator-footer">
      <div class="confidence-meter" v-if="translationConfidence">
        <span>Translation Confidence:</span>
        <progress :value="translationConfidence" max="100"></progress>
        <span>{{ translationConfidence }}%</span>
      </div>
      <div class="translation-stats" v-if="characterCount">
        <span>Characters: {{ characterCount }}</span>
        <span>Words: {{ wordCount }}</span>
      </div>
    </div>

    <TranslationHistory
      :history="translationHistory"
      @select-translation="selectHistoryItem"
    />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import LanguageSelector from './LanguageSelector.vue';
import TranslationHistory from './TranslationHistory.vue';
import { useTranslationStore } from '@/stores/translationStore';
import { useClipboard } from '@vueuse/core';
import { debounce } from 'lodash-es';

export default {
  name: 'LanguageTranslator',
  components: {
    LanguageSelector,
    TranslationHistory,
  },
  setup() {
    const translationStore = useTranslationStore();
    const { copy, copied } = useClipboard();

    const sourceLanguage = ref('en');
    const targetLanguage = ref('es');
    const sourceText = ref('');
    const translatedText = ref('');
    const isTranslating = ref(false);
    const translationConfidence = ref(null);

    const characterCount = computed(() => sourceText.value.length);
    const wordCount = computed(() => sourceText.value.trim().split(/\s+/).length);

    const translationHistory = computed(() => translationStore.getHistory);

    const translate = debounce(async () => {
      if (!sourceText.value.trim()) return;

      isTranslating.value = true;
      try {
        const result = await translationStore.translateText({
          text: sourceText.value,
          from: sourceLanguage.value,
          to: targetLanguage.value,
        });
        translatedText.value = result.translatedText;
        translationConfidence.value = result.confidence;
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        isTranslating.value = false;
      }
    }, 300);

    const handleInput = () => {
      translate();
    };

    const swapLanguages = () => {
      [sourceLanguage.value, targetLanguage.value] = [targetLanguage.value, sourceLanguage.value];
      translate();
    };

    const clearText = () => {
      sourceText.value = '';
      translatedText.value = '';
    };

    const pasteText = async () => {
      try {
        const text = await navigator.clipboard.readText();
        sourceText.value = text;
        translate();
      } catch (error) {
        console.error('Failed to read clipboard contents:', error);
      }
    };

    const copyTranslation = async () => {
      await copy(translatedText.value);
      if (copied.value) {
        // Show success notification
      }
    };

    const speakText = (text, language) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      speechSynthesis.speak(utterance);
    };

    const selectHistoryItem = (item) => {
      sourceLanguage.value = item.sourceLanguage;
      targetLanguage.value = item.targetLanguage;
      sourceText.value = item.sourceText;
      translatedText.value = item.translatedText;
    };

    watch([sourceLanguage, targetLanguage], () => {
      translate();
    });

    return {
      sourceLanguage,
      targetLanguage,
      sourceText,
      translatedText,
      isTranslating,
      translationConfidence,
      characterCount,
      wordCount,
      translationHistory,
      handleInput,
      swapLanguages,
      clearText,
      pasteText,
      copyTranslation,
      speakText,
      selectHistoryItem,
    };
  },
};
</script>

<style scoped>
.language-translator {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.translator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.swap-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.swap-btn:hover {
  transform: rotate(180deg);
}

.translator-body {
  display: flex;
  gap: 20px;
}

.input-section, .output-section {
  flex: 1;
}

textarea, .translation-result, .placeholder {
  width: 100%;
  min-height: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  resize: vertical;
}

.text-controls {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.text-controls button {
  padding: 5px 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.text-controls button:hover {
  background: #45a049;
}

.text-controls button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.translator-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.confidence-meter {
  display: flex;
  align-items: center;
  gap: 10px;
}

progress {
  width: 100px;
}

.translation-stats {
  font-size: 0.9em;
  color: #666;
}

@media (max-width: 768px) {
  .translator-body {
    flex-direction: column;
  }
}
</style>

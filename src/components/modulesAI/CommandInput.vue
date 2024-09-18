<template>
  <div class="command-input">
    <div class="input-container">
      <textarea
        v-model="localCommand"
        @input="updateCommand"
        :placeholder="placeholder"
        :disabled="disabled"
        class="command-textarea"
        ref="textarea"
      ></textarea>
      <div class="input-actions">
        <button @click="clearCommand" :disabled="disabled || !localCommand" class="clear-button">
          Clear
        </button>
        <button @click="pasteFromClipboard" :disabled="disabled" class="paste-button">
          Paste
        </button>
      </div>
    </div>
    <div class="command-options">
      <div class="option">
        <label for="maxTokens">Max Tokens:</label>
        <input 
          type="number" 
          id="maxTokens" 
          v-model.number="localMaxTokens" 
          @input="updateMaxTokens"
          :min="1"
          :max="maxTokensLimit"
        >
      </div>
      <div class="option">
        <label for="temperature">Temperature:</label>
        <input 
          type="range" 
          id="temperature" 
          v-model.number="localTemperature" 
          @input="updateTemperature"
          min="0"
          max="1"
          step="0.1"
        >
        <span>{{ localTemperature.toFixed(1) }}</span>
      </div>
    </div>
    <div v-if="suggestions.length > 0" class="suggestions">
      <h4>Suggestions:</h4>
      <ul>
        <li v-for="suggestion in suggestions" :key="suggestion" @click="applySuggestion(suggestion)">
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useAIStore } from '@/stores/aiStore';

export default {
  name: 'CommandInput',
  props: {
    command: {
      type: String,
      default: ''
    },
    maxTokens: {
      type: Number,
      default: 1000
    },
    temperature: {
      type: Number,
      default: 0.7
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Enter your command here...'
    }
  },
  emits: ['update:command', 'update:maxTokens', 'update:temperature'],
  setup(props, { emit }) {
    const aiStore = useAIStore();
    const textarea = ref(null);
    const localCommand = ref(props.command);
    const localMaxTokens = ref(props.maxTokens);
    const localTemperature = ref(props.temperature);
    const suggestions = ref([]);
    const maxTokensLimit = 4096; // Adjust based on the model's actual limit

    const updateCommand = () => {
      emit('update:command', localCommand.value);
      generateSuggestions();
    };

    const updateMaxTokens = () => {
      emit('update:maxTokens', localMaxTokens.value);
    };

    const updateTemperature = () => {
      emit('update:temperature', localTemperature.value);
    };

    const clearCommand = () => {
      localCommand.value = '';
      updateCommand();
    };

    const pasteFromClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        localCommand.value = text;
        updateCommand();
      } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
      }
    };

    const generateSuggestions = async () => {
      if (localCommand.value.length > 10) {
        suggestions.value = await aiStore.generateSuggestions(localCommand.value);
      } else {
        suggestions.value = [];
      }
    };

    const applySuggestion = (suggestion) => {
      localCommand.value += ' ' + suggestion;
      updateCommand();
    };

    const adjustTextareaHeight = () => {
      const element = textarea.value;
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    };

    watch(() => props.command, (newValue) => {
      localCommand.value = newValue;
    });

    onMounted(() => {
      adjustTextareaHeight();
    });

    watch(localCommand, () => {
      adjustTextareaHeight();
    });

    return {
      localCommand,
      localMaxTokens,
      localTemperature,
      suggestions,
      maxTokensLimit,
      textarea,
      updateCommand,
      updateMaxTokens,
      updateTemperature,
      clearCommand,
      pasteFromClipboard,
      applySuggestion
    };
  }
};
</script>

<style scoped>
.command-input {
  margin-bottom: 20px;
}

.input-container {
  display: flex;
  flex-direction: column;
}

.command-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.clear-button,
.paste-button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-button:hover,
.paste-button:hover {
  background-color: #e0e0e0;
}

.command-options {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.option {
  display: flex;
  align-items: center;
}

.option label {
  margin-right: 10px;
}

.option input[type="number"],
.option input[type="range"] {
  width: 100px;
}

.suggestions {
  margin-top: 10px;
}

.suggestions ul {
  list-style-type: none;
  padding: 0;
}

.suggestions li {
  cursor: pointer;
  padding: 5px;
  background-color: #f0f0f0;
  margin-bottom: 5px;
  border-radius: 4px;
}

.suggestions li:hover {
  background-color: #e0e0e0;
}
</style>
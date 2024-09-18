<template>
    <div class="command-creator">
        <textarea v-model="commandText" @input="autoResize" :placeholder="placeholder" :disabled="isProcessing"
            ref="commandInput" class="command-input"></textarea>
        <div class="command-controls">
            <button @click="submitCommand" :disabled="isProcessing || !commandText.trim()">
                {{ isProcessing ? 'Processing...' : 'Submit' }}
            </button>
            <button @click="clearCommand" :disabled="isProcessing || !commandText.trim()">
                Clear
            </button>
        </div>
        <div v-if="suggestions.length" class="command-suggestions">
            <p>Suggestions:</p>
            <ul>
                <li v-for="(suggestion, index) in suggestions" :key="index" @click="applySuggestion(suggestion)">
                    {{ suggestion }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useSuggestions } from '@/composables/useSuggestions';
import { useCommandHistory } from '@/composables/useCommandHistory';

export default {
    name: 'CommandCreator',
    props: {
        isProcessing: {
            type: Boolean,
            default: false
        }
    },
    emits: ['command-created'],
    setup(props, { emit }) {
        const commandText = ref('');
        const commandInput = ref(null);
        const { suggestions, generateSuggestions } = useSuggestions();
        const { addToHistory, getLastCommand } = useCommandHistory();

        const placeholder = "Enter your AI command here...";

        watch(commandText, (newValue) => {
            if (newValue.length > 3) {
                generateSuggestions(newValue);
            } else {
                suggestions.value = [];
            }
        });

        const autoResize = () => {
            const el = commandInput.value;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        };

        const submitCommand = () => {
            if (commandText.value.trim() && !props.isProcessing) {
                emit('command-created', commandText.value);
                addToHistory(commandText.value);
                commandText.value = '';
                autoResize();
            }
        };

        const clearCommand = () => {
            commandText.value = '';
            autoResize();
        };

        const applySuggestion = (suggestion) => {
            commandText.value += ' ' + suggestion;
            autoResize();
        };

        return {
            commandText,
            commandInput,
            suggestions,
            placeholder,
            autoResize,
            submitCommand,
            clearCommand,
            applySuggestion
        };
    }
};
</script>

<style scoped>
.command-creator {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.command-input {
    width: 100%;
    min-height: 100px;
    resize: vertical;
    padding: 10px;
    font-family: Arial, sans-serif;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.command-controls {
    display: flex;
    gap: 10px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    transition: background-color 0.3s;
}

button:hover:not(:disabled) {
    background-color: #45a049;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.command-suggestions {
    margin-top: 10px;
}

.command-suggestions ul {
    list-style-type: none;
    padding: 0;
}

.command-suggestions li {
    cursor: pointer;
    padding: 5px;
    background-color: #f1f1f1;
    margin-bottom: 5px;
    border-radius: 3px;
}

.command-suggestions li:hover {
    background-color: #e0e0e0;
}
</style>
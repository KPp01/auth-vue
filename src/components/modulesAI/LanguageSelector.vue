<template>
    <div class="language-selector">
        <label :for="id">{{ label }}</label>
        <select :id="id" v-model="selectedLanguage" @change="emitChange">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
            </option>
        </select>
    </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
    name: 'LanguageSelector',
    props: {
        modelValue: {
            type: String,
            required: true
        },
        label: {
            type: String,
            default: 'Select Language'
        }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        // Unikalny identyfikator dla elementu select
        const id = `language-selector-${Math.random().toString(36).substr(2, 9)}`;
        const selectedLanguage = ref(props.modelValue);

        // Lista dostępnych języków
        const languages = [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'it', name: 'Italian' },
            { code: 'pt', name: 'Portuguese' },
            { code: 'ru', name: 'Russian' },
            { code: 'zh', name: 'Chinese' },
            { code: 'ja', name: 'Japanese' },
            { code: 'ko', name: 'Korean' }
        ];

        // Funkcja emitująca zmianę wybranego języka
        const emitChange = () => {
            emit('update:modelValue', selectedLanguage.value);
        };

        // Aktualizacja lokalnej zmiennej, gdy modelValue się zmienia
        watch(() => props.modelValue, (newValue) => {
            selectedLanguage.value = newValue;
        });

        return {
            id,
            selectedLanguage,
            languages,
            emitChange
        };
    }
};
</script>

<style scoped>
.language-selector {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

label {
    font-size: 14px;
    color: #333;
}

select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    background-color: white;
    cursor: pointer;
}

select:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}
</style>

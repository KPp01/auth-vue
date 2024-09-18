import { ref } from 'vue';
import { useAIStore } from '@/stores/aiStore';

// Funkcja do analizy semantycznej
export const analyzeText = async (text) => {
  const aiStore = useAIStore();
  const analysisResult = ref(null);
  const error = ref(null);

  try {
    // Wywołanie usługi AI do analizy tekstu
    const result = await aiStore.analyzeText(text);
    analysisResult.value = result;
    return analysisResult.value;
  } catch (e) {
    console.error('Błąd podczas analizy tekstu:', e);
    error.value = 'Nie udało się przeprowadzić analizy semantycznej. Spróbuj ponownie.';
    return error.value;
  }
};

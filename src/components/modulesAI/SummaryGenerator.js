// src/components/modulesAI/SummaryGenerator.js
import { ref, computed } from 'vue';
import { useAIStore } from '@/stores/aiStore';
import { extractKeyPoints, generateBulletPoints } from '@/utils/textProcessing';

export default {
  name: 'SummaryGenerator',
  props: {
    text: {
      type: String,
      required: true
    },
    maxLength: {
      type: Number,
      default: 200
    },
    style: {
      type: String,
      default: 'concise',
      validator: (value) => ['concise', 'detailed', 'bullet-points'].includes(value)
    }
  },
  setup(props) {
    const aiStore = useAIStore();
    const summary = ref('');
    const isGenerating = ref(false);
    const error = ref(null);

    // Funkcja generująca podsumowanie na podstawie stylu i tekstu
    const generateSummary = async () => {
      isGenerating.value = true;
      error.value = null;

      try {
        let generatedSummary;

        // Wybór stylu podsumowania
        switch (props.style) {
          case 'concise':
            generatedSummary = await aiStore.generateConciseSummary(props.text, props.maxLength);
            break;
          case 'detailed':
            generatedSummary = await aiStore.generateDetailedSummary(props.text, props.maxLength);
            break;
          case 'bullet-points':
            const keyPoints = extractKeyPoints(props.text);
            generatedSummary = generateBulletPoints(keyPoints);
            break;
          default:
            throw new Error('Invalid summary style');
        }

        summary.value = generatedSummary;

      } catch (e) {
        console.error('Error generating summary:', e);
        error.value = 'Failed to generate summary. Please try again.';
      } finally {
        isGenerating.value = false;
      }
    };

    // Obliczenie długości podsumowania
    const summaryLength = computed(() => summary.value.length);

    return {
      summary,
      isGenerating,
      error,
      summaryLength,
      generateSummary
    };
  },

  render() {
    return this.$scopedSlots.default({
      summary: this.summary,
      isGenerating: this.isGenerating,
      error: this.error,
      summaryLength: this.summaryLength,
      generateSummary: this.generateSummary
    });
  }
};

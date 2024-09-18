<template>
    <div class="visualization-engine">
        <div class="visualization-controls">
            <select v-model="selectedVisualization">
                <option value="tokenDistribution">Token Distribution</option>
                <option value="sentimentAnalysis">Sentiment Analysis</option>
                <option value="conceptMap">Concept Map</option>
                <option value="timeSeriesAnalysis">Time Series Analysis</option>
            </select>
            <button @click="generateVisualization" :disabled="isGenerating">
                {{ isGenerating ? 'Generating...' : 'Generate Visualization' }}
            </button>
        </div>

        <div class="visualization-container" ref="visualizationContainer">
            <component :is="currentVisualizationComponent" :data="visualizationData"
                @update:data="updateVisualizationData"></component>
        </div>

        <div class="visualization-export">
            <button @click="exportVisualization('png')" :disabled="!visualizationData">Export as PNG</button>
            <button @click="exportVisualization('svg')" :disabled="!visualizationData">Export as SVG</button>
            <button @click="exportVisualization('json')" :disabled="!visualizationData">Export Data as JSON</button>
        </div>

        <AIInsightPanel :insights="aiInsights" @request-new-insight="generateAIInsight" />
    </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useAIStore } from '@/stores/aiStore';
import TokenDistributionChart from './visualizations/TokenDistributionChart.vue';
import SentimentAnalysisGraph from './visualizations/SentimentAnalysisGraph.vue';
import ConceptMapNetwork from './visualizations/ConceptMapNetwork.vue';
import TimeSeriesChart from './visualizations/TimeSeriesChart.vue';
import AIInsightPanel from './AIInsightPanel.vue';
import { generateVisualizationData, exportChart } from '@/utils/visualizationUtils';

export default {
    name: 'VisualizationEngine',
    components: {
        TokenDistributionChart,
        SentimentAnalysisGraph,
        ConceptMapNetwork,
        TimeSeriesChart,
        AIInsightPanel
    },
    setup() {
        const aiStore = useAIStore();
        const selectedVisualization = ref('tokenDistribution');
        const visualizationData = ref(null);
        const isGenerating = ref(false);
        const visualizationContainer = ref(null);
        const aiInsights = ref([]);

        const currentVisualizationComponent = computed(() => {
            switch (selectedVisualization.value) {
                case 'tokenDistribution': return TokenDistributionChart;
                case 'sentimentAnalysis': return SentimentAnalysisGraph;
                case 'conceptMap': return ConceptMapNetwork;
                case 'timeSeriesAnalysis': return TimeSeriesChart;
                default: return null;
            }
        });

        const generateVisualization = async () => {
            if (isGenerating.value) return; // Prevent multiple generations at the same time

            isGenerating.value = true;
            try {
                const data = await generateVisualizationData(selectedVisualization.value, aiStore.getCurrentConversation());
                visualizationData.value = data;
                await nextTick(); // Ensure DOM update
                generateAIInsight();
            } catch (error) {
                console.error('Error generating visualization:', error);
            } finally {
                isGenerating.value = false;
            }
        };

        const updateVisualizationData = (newData) => {
            visualizationData.value = newData;
        };

        const exportVisualization = async (format) => {
            if (!visualizationContainer.value) return;

            try {
                const result = await exportChart(visualizationContainer.value, format, selectedVisualization.value);
                if (format === 'json') {
                    const dataStr = JSON.stringify(visualizationData.value);
                    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                    const exportFileDefaultName = `${selectedVisualization.value}_data.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                } else {
                    const link = document.createElement('a');
                    link.download = `${selectedVisualization.value}_visualization.${format}`;
                    link.href = result;
                    link.click();
                }
            } catch (error) {
                console.error('Error exporting visualization:', error);
            }
        };

        const generateAIInsight = async () => {
            if (!visualizationData.value) return;

            try {
                const insight = await aiStore.generateInsight(visualizationData.value, selectedVisualization.value);
                aiInsights.value.unshift(insight);
            } catch (error) {
                console.error('Error generating AI insight:', error);
            }
        };

        onMounted(() => {
            generateVisualization();
        });

        watch(selectedVisualization, (newVisualization, oldVisualization) => {
            if (newVisualization !== oldVisualization) {
                generateVisualization();
            }
        });

        return {
            selectedVisualization,
            currentVisualizationComponent,
            visualizationData,
            isGenerating,
            visualizationContainer,
            aiInsights,
            generateVisualization,
            updateVisualizationData,
            exportVisualization,
            generateAIInsight
        };
    }
};
</script>

<style scoped>
.visualization-engine {
    background: #ffffff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.visualization-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

select,
button {
    padding: 10px 15px;
    border-radius: 5px;
    border: 1px solid #ddd;
    background: #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease;
}

select:hover,
button:hover {
    background: #e0e0e0;
}

.visualization-container {
    min-height: 400px;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
    margin-bottom: 20px;
}

.visualization-export {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.visualization-export button {
    background: #4CAF50;
    color: white;
    border: none;
}

.visualization-export button:hover {
    background: #45a049;
}

.visualization-export button:disabled {
    background: #cccccc;
    cursor: not-allowed;
}
</style>

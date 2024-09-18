<template>
    <div class="history-analysis">
      <h3>Advanced History Analysis</h3>
      <div v-if="analysisData" class="analysis-content">
        <div class="metrics">
          <div class="metric">
            <h4>Total Commands</h4>
            <p>{{ analysisData.totalCommands }}</p>
          </div>
          <div class="metric">
            <h4>Average Response Time</h4>
            <p>{{ formatTime(analysisData.averageResponseTime) }}</p>
          </div>
          <div class="metric">
            <h4>Most Used Model</h4>
            <p>{{ analysisData.mostUsedModel }}</p>
          </div>
        </div>
  
        <div class="charts">
          <div class="chart">
            <h4>Topic Distribution</h4>
            <pie-chart :chart-data="topicChartData" />
          </div>
          <div class="chart">
            <h4>Command Length Distribution</h4>
            <bar-chart :chart-data="commandLengthChartData" />
          </div>
        </div>
  
        <div class="advanced-metrics">
          <h4>Advanced Metrics</h4>
          <ul>
            <li>Complexity Trend: {{ analysisData.complexityTrend }}</li>
            <li>User Engagement Score: {{ analysisData.userEngagementScore.toFixed(2) }}</li>
            <li>AI Performance Index: {{ analysisData.aiPerformanceIndex.toFixed(2) }}</li>
          </ul>
        </div>
  
        <div class="time-series">
          <h4>Command Frequency Over Time</h4>
          <line-chart :chart-data="timeSeriesChartData" />
        </div>
      </div>
      <p v-else>No analysis data available. Start interacting with the AI to generate insights.</p>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useAIStore } from '@/stores/aiStore';
  import PieChart from '@/components/charts/PieChart.vue';
  import BarChart from '@/components/charts/BarChart.vue';
  import LineChart from '@/components/charts/LineChart.vue';
  
  export default {
    name: 'HistoryAnalysis',
    components: {
      PieChart,
      BarChart,
      LineChart,
    },
    props: {
      analysisData: {
        type: Object,
        default: () => null,
      },
    },
    setup(props) {
      const aiStore = useAIStore();
      const localAnalysisData = ref(null);
  
      const topicChartData = computed(() => ({
        labels: Object.keys(props.analysisData?.topTopics || {}),
        datasets: [
          {
            data: Object.values(props.analysisData?.topTopics || {}),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
          },
        ],
      }));
  
      const commandLengthChartData = computed(() => ({
        labels: ['0-50', '51-100', '101-200', '201+'],
        datasets: [
          {
            label: 'Command Length Distribution',
            data: props.analysisData?.commandLengthDistribution || [0, 0, 0, 0],
            backgroundColor: '#36A2EB',
          },
        ],
      }));
  
      const timeSeriesChartData = computed(() => ({
        labels: props.analysisData?.timeSeriesData?.map((d) => d.date) || [],
        datasets: [
          {
            label: 'Commands per Day',
            data: props.analysisData?.timeSeriesData?.map((d) => d.count) || [],
            borderColor: '#4BC0C0',
            fill: false,
          },
        ],
      }));
  
      const formatTime = (time) => {
        return time ? `${time.toFixed(2)}ms` : 'N/A';
      };
  
      onMounted(async () => {
        if (!props.analysisData) {
          localAnalysisData.value = await aiStore.generateHistoryAnalysis();
        }
      });
  
      watch(() => props.analysisData, (newData) => {
        if (newData) {
          localAnalysisData.value = newData;
        }
      });
  
      return {
        localAnalysisData,
        topicChartData,
        commandLengthChartData,
        timeSeriesChartData,
        formatTime,
      };
    },
  };
  </script>
  
  <style scoped>
  .history-analysis {
    background-color: var(--card-bg-color);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  h3,
  h4 {
    color: var(--heading-color);
    margin-bottom: 15px;
  }
  
  .analysis-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .metrics {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .metric {
    background-color: var(--metric-bg-color);
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    flex: 1;
    margin: 5px;
  }
  
  .charts {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .chart {
    background-color: var(--chart-bg-color);
    padding: 15px;
    border-radius: 8px;
  }
  
  .advanced-metrics ul {
    list-style-type: none;
    padding: 0;
  }
  
  .advanced-metrics li {
    margin-bottom: 10px;
    padding: 10px;
    background-color: var(--metric-bg-color);
    border-radius: 4px;
  }
  
  .time-series {
    grid-column: 1 / -1;
  }
  
  @media (max-width: 768px) {
    .analysis-content {
      grid-template-columns: 1fr;
    }
  }
  </style>
  
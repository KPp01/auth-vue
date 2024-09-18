<template>
  <div class="response-time-graph">
    <canvas ref="responseTimeChart"></canvas>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import { Chart } from 'chart.js';

export default {
  name: 'ResponseTimeGraph',
  props: {
    responseTimes: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const responseTimeChart = ref(null);
    let chartInstance = null;

    const createChart = () => {
      const ctx = responseTimeChart.value.getContext('2d');
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: props.responseTimes.map((_, index) => `Request ${index + 1}`),
          datasets: [
            {
              label: 'Response Time (ms)',
              data: props.responseTimes,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              borderWidth: 2,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Request'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Time (ms)'
              },
              beginAtZero: true
            }
          }
        }
      });
    };

    onMounted(() => {
      createChart();
    });

    // Watch for changes in responseTimes and update the chart accordingly
    watch(
      () => props.responseTimes,
      (newTimes) => {
        if (chartInstance) {
          chartInstance.data.labels = newTimes.map((_, index) => `Request ${index + 1}`);
          chartInstance.data.datasets[0].data = newTimes;
          chartInstance.update();
        }
      }
    );

    return {
      responseTimeChart
    };
  }
};
</script>

<style scoped>
.response-time-graph {
  max-width: 600px;
  margin: 0 auto;
}

canvas {
  width: 100%;
  height: 300px;
}
</style>

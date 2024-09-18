<template>
    <div class="chart-container">
      <canvas ref="lineCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { Chart, LineController, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
  
  Chart.register(LineController, LineElement, PointElement, Tooltip, Legend);
  
  export default {
    name: 'LineChart',
    props: {
      chartData: {
        type: Object,
        required: true
      },
      options: {
        type: Object,
        default: () => ({})
      }
    },
    setup(props) {
      const lineCanvas = ref(null);
      let lineChart = null;
  
      onMounted(() => {
        if (lineCanvas.value) {
          lineChart = new Chart(lineCanvas.value, {
            type: 'line',
            data: props.chartData,
            options: props.options
          });
        }
      });
  
      return {
        lineCanvas
      };
    }
  };
  </script>
  
  <style scoped>
  .chart-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }
  </style>
  
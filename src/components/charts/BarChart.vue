<template>
    <div class="chart-container">
      <canvas ref="barCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { Chart, BarController, BarElement, Tooltip, Legend } from 'chart.js';
  
  Chart.register(BarController, BarElement, Tooltip, Legend);
  
  export default {
    name: 'BarChart',
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
      const barCanvas = ref(null);
      let barChart = null;
  
      onMounted(() => {
        if (barCanvas.value) {
          barChart = new Chart(barCanvas.value, {
            type: 'bar',
            data: props.chartData,
            options: props.options
          });
        }
      });
  
      return {
        barCanvas
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
  
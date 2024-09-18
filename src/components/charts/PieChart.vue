<template>
    <div class="chart-container">
      <canvas ref="pieCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from 'vue';
  import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
  
  // Rejestracja komponentów Chart.js
  Chart.register(PieController, ArcElement, Tooltip, Legend);
  
  export default {
    name: 'PieChart',
    props: {
      chartData: {
        type: Object,
        required: true,
        validator(data) {
          return data.labels && data.datasets;
        },
      },
      options: {
        type: Object,
        default: () => ({}),
      },
    },
    setup(props) {
      const pieCanvas = ref(null);
      let pieChart = null;
  
      onMounted(() => {
        if (pieCanvas.value) {
          pieChart = new Chart(pieCanvas.value, {
            type: 'pie',
            data: props.chartData,
            options: props.options,
          });
        }
      });
  
      return {
        pieCanvas,
      };
    },
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
  
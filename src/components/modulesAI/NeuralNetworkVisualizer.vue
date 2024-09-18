<template>
  <div class="neural-network-visualizer">
    <canvas ref="canvas" width="800" height="600"></canvas>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';

export default {
  name: 'NeuralNetworkVisualizer',
  props: {
      activations: {
          type: Array,
          required: true
      }
  },
  setup(props) {
      const canvas = ref(null);
      const ctx = ref(null);

      // Funkcja rysująca aktywacje w sieci neuronowej
      const drawNetwork = () => {
          const context = ctx.value;
          const { activations } = props;

          if (!context || !activations.length) return;

          // Wyczyszczenie poprzednich rysunków
          context.clearRect(0, 0, canvas.value.width, canvas.value.height);

          const layerCount = activations.length;
          const nodeRadius = 15;
          const layerSpacing = canvas.value.width / (layerCount + 1);
          const maxNodes = Math.max(...activations.map(layer => layer.length));
          const nodeSpacing = canvas.value.height / (maxNodes + 1);

          activations.forEach((layer, layerIndex) => {
              layer.forEach((activation, nodeIndex) => {
                  const x = (layerIndex + 1) * layerSpacing;
                  const y = (nodeIndex + 1) * nodeSpacing;

                  // Narysowanie węzła
                  context.beginPath();
                  context.arc(x, y, nodeRadius, 0, Math.PI * 2);
                  context.fillStyle = `rgba(0, 0, 255, ${activation})`; // Kolor zależny od wartości aktywacji
                  context.fill();
                  context.stroke();

                  // Rysowanie połączeń między warstwami
                  if (layerIndex < layerCount - 1) {
                      const nextLayer = activations[layerIndex + 1];
                      nextLayer.forEach((_, nextNodeIndex) => {
                          const nextX = (layerIndex + 2) * layerSpacing;
                          const nextY = (nextNodeIndex + 1) * nodeSpacing;

                          context.beginPath();
                          context.moveTo(x, y);
                          context.lineTo(nextX, nextY);
                          context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                          context.stroke();
                      });
                  }
              });
          });
      };

      // Zainicjalizowanie rysowania po zamontowaniu komponentu
      onMounted(() => {
          ctx.value = canvas.value.getContext('2d');
          drawNetwork();
      });

      // Rysowanie sieci na nowo po zmianie aktywacji
      watch(() => props.activations, drawNetwork);

      return {
          canvas
      };
  }
};
</script>

<style scoped>
.neural-network-visualizer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

canvas {
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}
</style>

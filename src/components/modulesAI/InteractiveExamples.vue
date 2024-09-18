<template>
  <div class="interactive-examples">
    <h3>Interactive Examples</h3>
    <div v-for="(example, index) in examples" :key="index" class="example">
      <h4>{{ example.title }}</h4>
      <p>{{ example.description }}</p>
      <div class="code-container">
        <pre><code>{{ example.code }}</code></pre>
        <button @click="runExample(index)">Run</button>
      </div>
      <div v-if="example.result" class="result">
        <h5>Result:</h5>
        <pre>{{ example.result }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'InteractiveExamples',
  props: {
    initialExamples: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const examples = ref(props.initialExamples);

    const runExample = async (index) => {
      const example = examples.value[index];
      try {
        // Bezpieczne wykonanie kodu za pomocą funkcji `new Function()`
        const func = new Function(example.code);
        const result = await func(); // Uruchomienie kodu
        example.result = JSON.stringify(result, null, 2); // Formatowanie wyniku
      } catch (error) {
        example.result = `Error: ${error.message}`; // Obsługa błędów
      }
    };

    return {
      examples,
      runExample
    };
  }
};
</script>

<style scoped>
.interactive-examples {
  margin-top: 20px;
}

.example {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.code-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 10px;
}

pre {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.result {
  margin-top: 10px;
  background-color: #e9f7ef;
  padding: 10px;
  border-radius: 5px;
}
</style>

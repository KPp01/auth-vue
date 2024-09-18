<template>
    <div class="response-comparator">
      <h3>Response Comparison</h3>
      <div class="comparison-container">
        <div class="response response-a">
          <h4>Response A</h4>
          <pre>{{ responseA }}</pre>
        </div>
        <div class="response response-b">
          <h4>Response B</h4>
          <pre>{{ responseB }}</pre>
        </div>
      </div>
      <div class="diff-view">
        <h4>Differences</h4>
        <pre v-html="diffResult"></pre>
      </div>
      <div class="metrics">
        <h4>Comparison Metrics</h4>
        <p>Similarity Score: {{ similarityScore }}%</p>
        <p>Token Difference: {{ tokenDifference }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, watch } from 'vue';
  import { diffWords } from 'diff';
  import { tokenize } from '@/utils/tokenizer';
  import { calculateSimilarity } from '@/utils/textComparison';
  
  export default {
    name: 'ResponseComparator',
    props: {
      responseA: {
        type: String,
        required: true,
      },
      responseB: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const diffResult = ref('');
      const similarityScore = ref(0);
      const tokenDifference = ref(0);
  
      const updateComparison = () => {
        const diff = diffWords(props.responseA, props.responseB);
        diffResult.value = diff
          .map(part => {
            const color = part.added ? 'green' : part.removed ? 'red' : 'black';
            return `<span style="color: ${color};">${part.value}</span>`;
          })
          .join('');
  
        similarityScore.value = calculateSimilarity(props.responseA, props.responseB);
        const tokensA = tokenize(props.responseA);
        const tokensB = tokenize(props.responseB);
        tokenDifference.value = Math.abs(tokensA.length - tokensB.length);
      };
  
      watch(() => [props.responseA, props.responseB], updateComparison, { immediate: true });
  
      return {
        diffResult,
        similarityScore,
        tokenDifference,
      };
    },
  };
  </script>
  
  <style scoped>
  .response-comparator {
    margin-top: 20px;
  }
  
  .comparison-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .response {
    width: 48%;
  }
  
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 5px;
  }
  
  .diff-view pre {
    margin-top: 10px;
  }
  
  .metrics {
    margin-top: 20px;
  }
  </style>
  
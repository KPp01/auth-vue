const modelCapabilities = {
  'gpt-3.5-turbo': {
    maxTokens: 4096,
    capabilities: ['generalQuery', 'codeGeneration', 'summarization'],
    strengths: ['Fast responses', 'Good for general tasks'],
    weaknesses: ['Limited context understanding', 'May struggle with complex reasoning'],
  },
  'gpt-4': {
    maxTokens: 8192,
    capabilities: ['generalQuery', 'codeGeneration', 'dataAnalysis', 'complexReasoning'],
    strengths: ['Advanced reasoning', 'Better context understanding', 'More coherent long-form content'],
    weaknesses: ['Slower than GPT-3.5', 'Higher cost'],
  },
  'chatgpt-4o-latest': {
    maxTokens: 128000,
    capabilities: ['generalQuery', 'codeGeneration', 'dataAnalysis', 'complexReasoning', 'imageProcessing'],
    strengths: ['Very large context', 'Latest version of the model', 'Multimodal capabilities'],
    weaknesses: ['Not recommended for production', 'May change without warning'],
  },
  'gpt-4o-mini': {
    maxTokens: 128000,
    capabilities: ['generalQuery', 'codeGeneration', 'fastProcessing', 'imageProcessing'],
    strengths: ['Fast responses', 'Low cost', 'Good balance of capability and cost'],
    weaknesses: ['Less advanced than full GPT-4 models', 'May struggle with highly complex tasks'],
  },
};

/**
 * Retrieves the capabilities and limits of a given model.
 * @param {string} model - The name of the model.
 * @returns {Object} - Capabilities and limits of the model or defaults.
 */
export function getModelCapabilities(model) {
  return modelCapabilities[model] || {
    maxTokens: 1024,
    capabilities: ['generalQuery'],
    strengths: ['Unknown'],
    weaknesses: ['Unknown'],
  };
}

/**
 * Recommends the most appropriate model based on the intent, complexity, and token count.
 * @param {string} intent - The intent of the task (e.g., 'CODE_GENERATION', 'DATA_ANALYSIS').
 * @param {string} complexity - The complexity of the task ('Low', 'Medium', 'High').
 * @param {number} tokenCount - The number of tokens involved in the task.
 * @returns {string} - The recommended model name.
 */
export function recommendModel(intent, complexity, tokenCount) {
  if (complexity === 'High' && tokenCount > 4000) {
    return 'gpt-4';
  } else if (intent === 'CODE_GENERATION' || intent === 'DATA_ANALYSIS') {
    return tokenCount > 2000 ? 'gpt-4' : 'gpt-3.5-turbo';
  } else if (intent === 'GENERAL_QUERY' && complexity === 'Low') {
    return 'gpt-4o-mini';
  } else {
    return 'gpt-3.5-turbo';
  }
}

/**
 * Estimates the cost of a model based on the number of tokens used.
 * @param {string} model - The name of the model.
 * @param {number} tokenCount - The number of tokens involved.
 * @returns {number} - The estimated cost of the operation.
 */
export function estimateCost(model, tokenCount) {
  const costPerToken = {
    'gpt-3.5-turbo': 0.000002,
    'gpt-4': 0.00003,
    'chatgpt-4o-latest': 0.00005, // Example price, adjust as needed
    'gpt-4o-mini': 0.000001, // Example price, adjust as needed
  };

  return (costPerToken[model] || 0) * tokenCount;
}

import { tokenize } from './tokenizer';

export function analyzeComplexity(text) {
  const tokens = tokenize(text);
  const sentenceCount = text.split(/[.!?]+/).length;
  const averageWordLength = tokens.reduce((sum, word) => sum + word.length, 0) / tokens.length;
  const uniqueWords = new Set(tokens).size;
  const lexicalDiversity = uniqueWords / tokens.length;

  const complexityScore = calculateComplexityScore(tokens.length, sentenceCount, averageWordLength, lexicalDiversity);

  return {
    complexity: getComplexityLevel(complexityScore),
    score: complexityScore,
    metrics: {
      tokenCount: tokens.length,
      sentenceCount,
      averageWordLength,
      lexicalDiversity,
    },
  };
}

function calculateComplexityScore(tokenCount, sentenceCount, averageWordLength, lexicalDiversity) {
  const weightedScore = 
    (tokenCount * 0.3) + 
    (sentenceCount * 0.2) + 
    (averageWordLength * 20) + 
    (lexicalDiversity * 100);

  return Math.min(Math.max(weightedScore / 100, 0), 1);
}

function getComplexityLevel(score) {
  if (score < 0.3) return 'Low';
  if (score < 0.6) return 'Medium';
  return 'High';
}

export function suggestComplexityImprovements(complexityAnalysis) {
  const suggestions = [];

  if (complexityAnalysis.metrics.averageWordLength > 6) {
    suggestions.push('Consider using simpler words to improve readability.');
  }

  if (complexityAnalysis.metrics.lexicalDiversity < 0.4) {
    suggestions.push('Try to use a more diverse vocabulary to enrich the text.');
  }

  if (complexityAnalysis.metrics.sentenceCount < 3 && complexityAnalysis.metrics.tokenCount > 50) {
    suggestions.push('Consider breaking down long sentences into shorter ones for clarity.');
  }

  return suggestions;
}
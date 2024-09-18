import { tokenize } from '@/utils/tokenizer';
import { analyzeComplexity } from '@/utils/complexityAnalysis';

export function analyzeIntent(command) {
  const tokens = tokenize(command);
  const complexity = analyzeComplexity(command);

  const intents = {
    CODE_GENERATION: /\b(generate|create|write|implement)\s+(code|function|class|module)\b/i,
    DATA_ANALYSIS: /\b(analyze|examine|investigate|study)\s+(data|information|statistics)\b/i,
    SUMMARIZATION: /\b(summarize|summarise|recap|condense)\b/i,
    TRANSLATION: /\b(translate|convert)\s+(\w+)\s+to\s+(\w+)\b/i,
    EXPLANATION: /\b(explain|clarify|elucidate)\b/i,
    CREATIVE_WRITING: /\b(write|compose|create)\s+(story|poem|article|essay)\b/i,
  };

  let detectedIntent = 'GENERAL_QUERY';
  for (const [intent, regex] of Object.entries(intents)) {
    if (regex.test(command)) {
      detectedIntent = intent;
      break;
    }
  }

  return {
    intent: detectedIntent,
    complexity,
    tokenCount: tokens.length,
    topKeywords: extractTopKeywords(tokens),
  };
}

function extractTopKeywords(tokens, topN = 5) {
  const keywordCounts = tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([keyword]) => keyword);
}
// src/utils/textComparison.js

function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function cosineSimilarity(text1, text2) {
  const vectorize = text => {
    const tokens = text.split(/\s+/);
    const frequency = {};
    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });
    return frequency;
  };

  const vec1 = vectorize(text1);
  const vec2 = vectorize(text2);

  const intersection = Object.keys(vec1).filter(token => vec2[token]);
  let dotProduct = 0;
  intersection.forEach(token => {
    dotProduct += vec1[token] * vec2[token];
  });

  const magnitude1 = Math.sqrt(Object.values(vec1).reduce((acc, val) => acc + val * val, 0));
  const magnitude2 = Math.sqrt(Object.values(vec2).reduce((acc, val) => acc + val * val, 0));

  if (!magnitude1 || !magnitude2) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

export function calculateSimilarity(text1, text2) {
  const tokens1 = text1.split(/\s+/);
  const tokens2 = text2.split(/\s+/);

  const levenshteinSim = 1 - levenshteinDistance(text1, text2) / Math.max(text1.length, text2.length);
  const cosineSim = cosineSimilarity(text1, text2);

  return (levenshteinSim + cosineSim) / 2;
}

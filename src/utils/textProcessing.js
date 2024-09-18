// Funkcja do wyliczenia istotności terminów (tf-idf uproszczone)
function calculateTfIdf(tokens, allTokens) {
  const tf = {};
  tokens.forEach((token) => {
    tf[token] = (tf[token] || 0) + 1;
  });

  const idf = {};
  const numDocs = allTokens.length;
  allTokens.forEach((docTokens) => {
    const uniqueTokens = new Set(docTokens);
    uniqueTokens.forEach((token) => {
      idf[token] = (idf[token] || 0) + 1;
    });
  });

  const tfidf = {};
  Object.keys(tf).forEach((token) => {
    tfidf[token] = (tf[token] / tokens.length) * Math.log(numDocs / (idf[token] || 1));
  });

  return tfidf;
}

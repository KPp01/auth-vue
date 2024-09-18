// Funkcja do tokenizacji tekstu
export function tokenize(text, options = {}) {
  const {
    lowercase = true,
    removeStopwords = true,
    stem = false,
    removePunctuation = true,
  } = options;

  let processedText = text;

  // Zamiana na małe litery
  if (lowercase) {
    processedText = processedText.toLowerCase();
  }

  // Usuwanie znaków interpunkcyjnych
  if (removePunctuation) {
    processedText = processedText.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
  }

  // Tokenizacja na podstawie białych znaków
  let tokens = processedText.split(/\s+/);

  // Usuwanie stopwordów
  if (removeStopwords) {
    const stopwords = new Set(["i", "oraz", "ale", "to", "w", "z", "na", "o"]); // Możesz dodać więcej stopwordów
    tokens = tokens.filter(token => !stopwords.has(token));
  }

  // Opcjonalne stemmowanie (tu uproszczona wersja)
  if (stem) {
    tokens = tokens.map(token => simpleStemmer(token));
  }

  return tokens;
}

// Funkcja do prostej stemmizacji (przykład dla języka angielskiego, można dostosować do innych języków)
function simpleStemmer(word) {
  return word.replace(/(ing|ed|s)$/, ''); // Przykładowe usuwanie końcówek
}

// Funkcja do obliczania częstości tokenów
export function calculateTokenFrequency(tokens) {
  return tokens.reduce((freq, token) => {
    freq[token] = (freq[token] || 0) + 1;
    return freq;
  }, {});
}

// Funkcja do wyciągania najczęstszych tokenów
export function getTopNTokens(tokens, n = 10) {
  const freq = calculateTokenFrequency(tokens);
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([token, frequency]) => ({ token, frequency }));
}

// Funkcja do oszacowania liczby tokenów (przybliżenie dla modeli OpenAI)
export function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

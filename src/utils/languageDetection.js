import { tokenize } from './tokenizer';

// Proste listy słów charakterystycznych dla angielskiego i polskiego
const englishWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i']);
const polishWords = new Set(['i', 'w', 'się', 'na', 'jest', 'nie', 'to', 'że', 'co', 'z']);

export function detectLanguage(text) {
  const tokens = tokenize(text, { removeStopwords: false, stem: false });
  let englishScore = 0;
  let polishScore = 0;

  tokens.forEach((token) => {
    if (englishWords.has(token)) englishScore++;
    if (polishWords.has(token)) polishScore++;
  });

  if (englishScore > polishScore) {
    return {
      languageCode: 'en',
      languageName: 'English',
      confidence: (englishScore / tokens.length).toFixed(2),
    };
  } else {
    return {
      languageCode: 'pl',
      languageName: 'Polish',
      confidence: (polishScore / tokens.length).toFixed(2),
    };
  }
}

export function detectMultipleLanguages(text) {
  // W tej uproszczonej wersji zakładamy, że tekst jest jednolity w jednym języku
  return [detectLanguage(text)];
}

import { tokenize } from './tokenizer';

export function analyzeReadability(text) {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = tokenize(text, { removeStopwords: false, stem: false });
  const syllables = countSyllables(words);

  const averageWordsPerSentence = words.length / sentences.length;
  const averageSyllablesPerWord = syllables / words.length;

  const fleschKincaidGrade = calculateFleschKincaidGrade(words.length, sentences.length, syllables);
  const fleschReadingEase = calculateFleschReadingEase(words.length, sentences.length, syllables);
  const smogIndex = calculateSMOGIndex(sentences.length, syllables);
  const automatedReadabilityIndex = calculateAutomatedReadabilityIndex(text, words.length, sentences.length);

  return {
    fleschKincaidGrade,
    fleschReadingEase,
    smogIndex,
    automatedReadabilityIndex,
    averageWordsPerSentence,
    averageSyllablesPerWord,
    totalWords: words.length,
    totalSentences: sentences.length,
    totalSyllables: syllables,
  };
}

function countSyllables(words) {
  return words.reduce((count, word) => count + countWordSyllables(word), 0);
}

function countWordSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  return word.match(/[aeiouy]{1,2}/g)?.length || 1;
}

function calculateFleschKincaidGrade(words, sentences, syllables) {
  return (0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59).toFixed(1);
}

function calculateFleschReadingEase(words, sentences, syllables) {
  return (206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)).toFixed(1);
}

function calculateSMOGIndex(sentences, syllables) {
  return (1.0430 * Math.sqrt(syllables * (30 / sentences)) + 3.1291).toFixed(1);
}

function calculateAutomatedReadabilityIndex(text, words, sentences) {
  const characters = text.replace(/\s+/g, '').length;
  return (4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43).toFixed(1);
}

export function getReadabilityLevel(fleschReadingEase) {
  if (fleschReadingEase >= 90) return "Very Easy";
  if (fleschReadingEase >= 80) return "Easy";
  if (fleschReadingEase >= 70) return "Fairly Easy";
  if (fleschReadingEase >= 60) return "Standard";
  if (fleschReadingEase >= 50) return "Fairly Difficult";
  if (fleschReadingEase >= 30) return "Difficult";
  return "Very Confusing";
}
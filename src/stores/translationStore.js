import { defineStore } from 'pinia';
import axios from 'axios';
import { detectLanguage } from '@/utils/languageDetection';

const TRANSLATION_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = process.env.VUE_APP_GOOGLE_TRANSLATE_API_KEY;

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    history: [],
    supportedLanguages: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getHistoryByLanguagePair: (state) => (from, to) => {
      return state.history.filter(entry => entry.from === from && entry.to === to);
    },
    getMostUsedLanguages: (state) => {
      const languageCounts = state.history.reduce((acc, entry) => {
        acc[entry.from] = (acc[entry.from] || 0) + 1;
        acc[entry.to] = (acc[entry.to] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang);
    },
  },

  actions: {
    async fetchSupportedLanguages() {
      try {
        const response = await axios.get(`${TRANSLATION_API_URL}/languages`, {
          params: { key: API_KEY }
        });
        this.supportedLanguages = response.data.data.languages;
      } catch (error) {
        console.error('Error fetching supported languages:', error);
        this.error = 'Failed to fetch supported languages';
      }
    },

    async translateText({ text, from, to }) {
      this.isLoading = true;
      this.error = null;
      try {
        if (!from) {
          const detectedLanguage = await detectLanguage(text);
          from = detectedLanguage.languageCode;
        }

        const response = await axios.post(`${TRANSLATION_API_URL}`, null, {
          params: {
            key: API_KEY,
            q: text,
            source: from,
            target: to,
            format: 'text'
          }
        });

        const translatedText = response.data.data.translations[0].translatedText;
        const newEntry = { original: text, translated: translatedText, from, to, timestamp: new Date() };
        this.history.unshift(newEntry);

        return { translatedText, detectedSourceLanguage: from, confidence: 1 }; // Google Translate doesn't provide confidence scores
      } catch (error) {
        console.error('Translation error:', error);
        this.error = 'Failed to translate text';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearHistory() {
      this.history = [];
    },

    removeHistoryEntry(index) {
      this.history.splice(index, 1);
    },

    async batchTranslate(texts, from, to) {
      this.isLoading = true;
      this.error = null;
      try {
        const translations = await Promise.all(
          texts.map(text => this.translateText({ text, from, to }))
        );
        return translations.map(t => t.translatedText);
      } catch (error) {
        console.error('Batch translation error:', error);
        this.error = 'Failed to perform batch translation';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async detectLanguage(text) {
      try {
        const response = await axios.post(`${TRANSLATION_API_URL}/detect`, null, {
          params: {
            key: API_KEY,
            q: text
          }
        });
        return response.data.data.detections[0][0];
      } catch (error) {
        console.error('Language detection error:', error);
        this.error = 'Failed to detect language';
        throw error;
      }
    },

    getTranslationStatistics() {
      const totalTranslations = this.history.length;
      const languagePairs = {};
      const characterCounts = {
        original: 0,
        translated: 0,
      };

      this.history.forEach(entry => {
        const pair = `${entry.from}-${entry.to}`;
        languagePairs[pair] = (languagePairs[pair] || 0) + 1;
        characterCounts.original += entry.original.length;
        characterCounts.translated += entry.translated.length;
      });

      const mostUsedPair = Object.entries(languagePairs)
        .sort((a, b) => b[1] - a[1])[0];

      return {
        totalTranslations,
        mostUsedLanguagePair: mostUsedPair ? mostUsedPair[0] : null,
        averageOriginalLength: totalTranslations ? characterCounts.original / totalTranslations : 0,
        averageTranslatedLength: totalTranslations ? characterCounts.translated / totalTranslations : 0,
        expansionRatio: characterCounts.original ? characterCounts.translated / characterCounts.original : 1,
      };
    },
  },
});
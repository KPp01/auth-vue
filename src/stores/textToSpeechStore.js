import { defineStore } from 'pinia';
import axios from 'axios';

const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const API_KEY = process.env.VUE_APP_GOOGLE_TTS_API_KEY;

export const useTextToSpeechStore = defineStore('textToSpeech', {
  state: () => ({
    voices: [],
    currentVoice: null,
    audioCache: new Map(),
    isLoading: false,
    error: null,
    playbackRate: 1,
    pitch: 1,
    volume: 1,
  }),

  getters: {
    availableLanguages: (state) => {
      return [...new Set(state.voices.map(voice => voice.languageCodes[0]))];
    },
    getVoicesByLanguage: (state) => (languageCode) => {
      return state.voices.filter(voice => voice.languageCodes.includes(languageCode));
    },
  },

  actions: {
    async loadVoices() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${TTS_API_URL}/voices`, {
          params: { key: API_KEY }
        });
        this.voices = response.data.voices;
        if (this.voices.length > 0 && !this.currentVoice) {
          this.currentVoice = this.voices[0];
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        this.error = 'Failed to load voices';
      } finally {
        this.isLoading = false;
      }
    },

    async synthesizeSpeech(text) {
      this.isLoading = true;
      this.error = null;
      try {
        const cacheKey = `${text}_${this.currentVoice.name}_${this.playbackRate}_${this.pitch}`;
        if (this.audioCache.has(cacheKey)) {
          return this.audioCache.get(cacheKey);
        }

        const response = await axios.post(TTS_API_URL, {
          input: { text },
          voice: {
            languageCode: this.currentVoice.languageCodes[0],
            name: this.currentVoice.name,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: this.playbackRate,
            pitch: this.pitch,
          },
        }, {
          params: { key: API_KEY }
        });

        const audioContent = response.data.audioContent;
        const audioBlob = this.base64ToBlob(audioContent, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);

        this.audioCache.set(cacheKey, audioUrl);
        return audioUrl;
      } catch (error) {
        console.error('Speech synthesis error:', error);
        this.error = 'Failed to synthesize speech';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async speak(text) {
      try {
        const audioUrl = await this.synthesizeSpeech(text);
        const audio = new Audio(audioUrl);
        audio.playbackRate = this.playbackRate;
        audio.volume = this.volume;
        await audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        this.error = 'Failed to play audio';
      }
    },

    setVoice(voiceName) {
      const voice = this.voices.find(v => v.name === voiceName);
      if (voice) {
        this.currentVoice = voice;
      } else {
        console.error('Voice not found:', voiceName);
      }
    },

    setPlaybackRate(rate) {
      this.playbackRate = Math.max(0.25, Math.min(4, rate));
    },

    setPitch(pitch) {
      this.pitch = Math.max(-20, Math.min(20, pitch));
    },

    setVolume(volume) {
      this.volume = Math.max(0, Math.min(1, volume));
    },

    clearCache() {
      this.audioCache.forEach(url => URL.revokeObjectURL(url));
      this.audioCache.clear();
    },

    base64ToBlob(base64, mimeType) {
      const byteCharacters = atob(base64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: mimeType });
    },

    async convertTextToSSML(text) {
      // This is a simple example. You might want to implement more sophisticated SSML conversion.
      return `<speak>${text}</speak>`;
    },

    async analyzeAudioCharacteristics(audioUrl) {
      // This would typically be done on the server side with audio processing libraries
      // For this example, we'll return mock data
      return {
        duration: 10.5, // seconds
        averageAmplitude: 0.7,
        peakAmplitude: 0.9,
        frequencySpectrum: [
          { frequency: 100, amplitude: 0.5 },
          { frequency: 1000, amplitude: 0.8 },
          { frequency: 10000, amplitude: 0.2 },
        ],
      };
    },
  },
});
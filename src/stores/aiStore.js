import { defineStore } from 'pinia';
import axios from 'axios';
import { analyzeIntent } from '@/components/modulesAI/IntentAnalyzer';
import { getModelCapabilities, recommendModel } from '@/components/modulesAI/ModelAnalyzer';
import { tokenize } from '@/utils/tokenizer';
import { analyzeComplexity } from '@/utils/complexityAnalysis';

export const useAIStore = defineStore('ai', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    availableModels: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-32k', 'chatgpt-4o-latest', 'gpt-4o-mini'],
    selectedModel: 'gpt-3.5-turbo',
    apiKey: null,
    isProcessing: false,
    error: null,
  }),

  getters: {
    getCurrentConversation: (state) => state.currentConversation,
    getConversationById: (state) => (id) => state.conversations.find(conv => conv.id === id),
    getModelCapabilities: (state) => getModelCapabilities(state.selectedModel),
  },

  actions: {
    async initializeConversation(topic) {
      const newConversation = {
        id: Date.now().toString(),
        topic,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.conversations.push(newConversation);
      this.currentConversation = newConversation;
    },

    async sendMessage(message) {
      if (!this.currentConversation) {
        throw new Error('No active conversation');
      }

      this.isProcessing = true;
      this.error = null;

      try {
        const tokens = tokenize(message);
        const intent = analyzeIntent(message);
        const complexity = analyzeComplexity(message);

        const recommendedModel = recommendModel(intent, complexity, tokens.length);
        if (recommendedModel !== this.selectedModel) {
          console.warn(`Recommended model (${recommendedModel}) differs from selected model (${this.selectedModel})`);
        }

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: this.selectedModel,
          messages: [
            ...this.currentConversation.messages.map(m => ({role: m.role, content: m.content})),
            {role: 'user', content: message}
          ],
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const aiMessage = response.data.choices[0].message.content;

        this.currentConversation.messages.push(
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: aiMessage, timestamp: new Date() }
        );
        this.currentConversation.updatedAt = new Date();

        return aiMessage;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },

    setApiKey(key) {
      this.apiKey = key;
    },

    selectModel(model) {
      if (this.availableModels.includes(model)) {
        this.selectedModel = model;
      } else {
        throw new Error('Invalid model selected');
      }
    },

    async generateInsight(data, type) {
      // Implement custom insight generation logic here
      const insight = await this.sendMessage(`Generate an insight about the following ${type} data: ${JSON.stringify(data)}`);
      return insight;
    },

    exportConversation(id) {
      const conversation = this.getConversationById(id);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      return JSON.stringify(conversation, null, 2);
    },

    importConversation(conversationData) {
      const parsedData = JSON.parse(conversationData);
      if (!parsedData.id || !parsedData.topic || !Array.isArray(parsedData.messages)) {
        throw new Error('Invalid conversation data format');
      }
      this.conversations.push(parsedData);
    },

    deleteConversation(id) {
      const index = this.conversations.findIndex(conv => conv.id === id);
      if (index !== -1) {
        this.conversations.splice(index, 1);
        if (this.currentConversation && this.currentConversation.id === id) {
          this.currentConversation = null;
        }
      }
    },

    async analyzeConversationTrends() {
      // Implement conversation analysis logic here
      // This could include sentiment analysis, topic modeling, etc.
      // For now, we'll just return a placeholder
      return {
        totalConversations: this.conversations.length,
        averageMessagesPerConversation: this.conversations.reduce((acc, conv) => acc + conv.messages.length, 0) / this.conversations.length,
        mostCommonTopics: ['placeholder topic 1', 'placeholder topic 2'],
      };
    },
  },
});
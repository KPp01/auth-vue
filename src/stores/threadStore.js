import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useAIStore } from './aiStore';

export const useThreadStore = defineStore('thread', {
  state: () => ({
    threads: [],
    currentThreadId: null,
  }),

  getters: {
    currentThread: (state) => state.threads.find(thread => thread.id === state.currentThreadId),
    getThreadById: (state) => (id) => state.threads.find(thread => thread.id === id),
    sortedThreads: (state) => [...state.threads].sort((a, b) => b.updatedAt - a.updatedAt),
  },

  actions: {
    async createThread(name) {
      const newThread = {
        id: uuidv4(),
        name,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          totalTokens: 0,
          sentiment: 'neutral',
          topics: [],
        },
      };
      this.threads.push(newThread);
      this.currentThreadId = newThread.id;
      return newThread;
    },

    async deleteThread(id) {
      const index = this.threads.findIndex(thread => thread.id === id);
      if (index !== -1) {
        this.threads.splice(index, 1);
        if (this.currentThreadId === id) {
          this.currentThreadId = this.threads.length > 0 ? this.threads[0].id : null;
        }
      }
    },

    async renameThread(id, newName) {
      const thread = this.getThreadById(id);
      if (thread) {
        thread.name = newName;
        thread.updatedAt = new Date();
      }
    },

    setCurrentThread(id) {
      if (this.getThreadById(id)) {
        this.currentThreadId = id;
      }
    },

    async addMessageToThread(threadId, role, content) {
      const thread = this.getThreadById(threadId);
      if (thread) {
        const aiStore = useAIStore();
        const newMessage = {
          id: uuidv4(),
          role,
          content,
          timestamp: new Date(),
        };
        thread.messages.push(newMessage);
        thread.updatedAt = new Date();

        // Update metadata
        thread.metadata.totalTokens += aiStore.estimateTokenCount(content);
        thread.metadata.sentiment = await aiStore.analyzeSentiment(content);
        thread.metadata.topics = await aiStore.extractTopics(thread.messages.map(m => m.content).join(' '));

        return newMessage;
      }
    },

    async generateThreadSummary(threadId) {
      const thread = this.getThreadById(threadId);
      if (thread) {
        const aiStore = useAIStore();
        const summary = await aiStore.generateSummary(thread.messages.map(m => m.content).join('\n'));
        return summary;
      }
    },

    async analyzeThreadInsights(threadId) {
      const thread = this.getThreadById(threadId);
      if (thread) {
        const aiStore = useAIStore();
        const insights = await aiStore.analyzeConversation(thread.messages);
        return insights;
      }
    },

    exportThread(id) {
      const thread = this.getThreadById(id);
      if (thread) {
        return JSON.stringify(thread, null, 2);
      }
    },

    importThread(threadData) {
      const parsedData = JSON.parse(threadData);
      if (!parsedData.id || !parsedData.name || !Array.isArray(parsedData.messages)) {
        throw new Error('Invalid thread data format');
      }
      this.threads.push(parsedData);
    },

    async mergeThreads(threadIds) {
      if (threadIds.length < 2) {
        throw new Error('At least two threads are required for merging');
      }

      const threadsToMerge = threadIds.map(id => this.getThreadById(id)).filter(Boolean);
      if (threadsToMerge.length !== threadIds.length) {
        throw new Error('One or more thread IDs are invalid');
      }

      const newThread = await this.createThread(`Merged Thread ${new Date().toISOString()}`);
      const allMessages = threadsToMerge.flatMap(thread => thread.messages)
        .sort((a, b) => a.timestamp - b.timestamp);

      for (const message of allMessages) {
        await this.addMessageToThread(newThread.id, message.role, message.content);
      }

      // Delete original threads
      for (const threadId of threadIds) {
        await this.deleteThread(threadId);
      }

      return newThread;
    },
  },
});
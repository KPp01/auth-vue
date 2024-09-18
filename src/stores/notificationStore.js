// src/stores/notificationStore.js

import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notificationStore', {
  state: () => ({
    notifications: [], // tablica powiadomień
  }),
  actions: {
    addNotification(notification) {
      this.notifications.push(notification) // dodaje powiadomienie
    },
    removeNotification(index) {
      this.notifications.splice(index, 1) // usuwa powiadomienie z określonego indeksu
    },
    clearNotifications() {
      this.notifications = [] // czyści wszystkie powiadomienia
    }
  },
  getters: {
    notificationCount: (state) => state.notifications.length // zwraca liczbę powiadomień
  }
});

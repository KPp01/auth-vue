<template>
    <div class="notifications-container">
      <transition-group name="slide" tag="div">
        <div v-for="(notification, index) in notifications" :key="notification.id" class="notification" :class="notification.type">
          <div class="notification-content">
            <i :class="getIcon(notification.type)" class="notification-icon"></i>
            <div class="notification-message">
              <strong>{{ notification.title }}</strong>
              <p>{{ notification.message }}</p>
            </div>
          </div>
          <button class="close-button" @click="removeNotification(index)">&#10005;</button>
        </div>
      </transition-group>
    </div>
  </template>
  
  <script>
  let nextNotificationId = 0;
  
  export default {
    data() {
      return {
        notifications: []
      };
    },
    methods: {
      addNotification({ type = 'info', title = 'Powiadomienie', message = 'Treść powiadomienia', duration = 5000 }) {
        const id = nextNotificationId++;
        this.notifications.push({ id, type, title, message });
  
        // Usuwanie powiadomienia po określonym czasie
        setTimeout(() => {
          this.removeNotificationById(id);
        }, duration);
      },
      removeNotification(index) {
        this.notifications.splice(index, 1);
      },
      removeNotificationById(id) {
        const index = this.notifications.findIndex(notification => notification.id === id);
        if (index !== -1) {
          this.removeNotification(index);
        }
      },
      getIcon(type) {
        switch (type) {
          case 'success': return 'pi pi-check-circle';
          case 'error': return 'pi pi-times-circle';
          case 'warning': return 'pi pi-exclamation-triangle';
          case 'info': return 'pi pi-info-circle';
          default: return 'pi pi-info-circle';
        }
      },
      sendPushNotification(title, body) {
        if ('Notification' in window) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(title, { body });
            }
          });
        }
      }
    },
    mounted() {
      // Przykładowe powiadomienie po załadowaniu komponentu
      this.addNotification({
        type: 'info',
        title: 'Witaj w systemie',
        message: 'To jest Twoje pierwsze powiadomienie!',
        duration: 7000
      });
    }
  };
  </script>
  
  <style scoped>
  .notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .notification {
    background-color: var(--notification-bg);
    color: var(--notification-text);
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  .notification.success {
    border-left: 5px solid var(--success-color);
  }
  
  .notification.error {
    border-left: 5px solid var(--error-color);
  }
  
  .notification.warning {
    border-left: 5px solid var(--warning-color);
  }
  
  .notification.info {
    border-left: 5px solid var(--info-color);
  }
  
  .notification-content {
    display: flex;
    align-items: center;
  }
  
  .notification-icon {
    font-size: 1.5rem;
    margin-right: 10px;
  }
  
  .notification-message {
    max-width: 200px;
  }
  
  .notification-message strong {
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .notification-message p {
    font-size: 0.9rem;
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: var(--notification-text);
    cursor: pointer;
  }
  
  .close-button:hover {
    color: var(--close-button-hover);
  }
  
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-enter, .slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
  </style>
  
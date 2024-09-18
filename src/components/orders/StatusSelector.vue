<template>
  <div class="status-dropdown">
    <select v-model="status" @change="updateStatus" class="status-select" :class="getStatusClass(status)">
      <option v-for="option in statusOptions" :key="option" :value="option">
        {{ formatStatus(option) }}
      </option>
    </select>
    <i class="pi pi-chevron-down dropdown-icon"></i>
  </div>
</template>

<script>
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/main';

export default {
  props: {
    initialStatus: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      status: this.initialStatus,
      statusOptions: [
        'nowe',
        'oczekujące',
        'do realizacji',
        'w realizacji',
        'zrealizowane',
        'reklamacja',
      ],
    };
  },
  methods: {
    async updateStatus() {
      try {
        const orderRef = doc(db, 'orders', this.orderId);
        await updateDoc(orderRef, {
          status: this.status,
        });
        this.$emit('status-updated', this.status);
      } catch (error) {
        console.error('Błąd podczas aktualizacji statusu: ', error);
      }
    },
    formatStatus(status) {
      const formattedStatuses = {
        nowe: 'Nowe',
        oczekujące: 'Oczekujące',
        'do realizacji': 'Do realizacji',
        'w realizacji': 'W realizacji',
        zrealizowane: 'Zrealizowane',
        reklamacja: 'Reklamacja',
      };
      return formattedStatuses[status] || status;
    },
    getStatusClass(status) {
      return `status-${status.replace(/\s+/g, '-')}`;
    },
  },
};
</script>

<style scoped>
.status-dropdown {
  position: relative;
  width: 100%;
}

.status-select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  border: 2px solid var(--primary-color);
  background-color: var(--input-background);
  color: var(--text-color);
  appearance: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.status-select:hover, .status-select:focus {
  border-color: var(--primary-hover-color);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.dropdown-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: var(--primary-color);
}

/* Dynamiczne kolory statusów */
.status-nowe {
  background-color: var(--status-new);
  color: #fff;
}

.status-oczekujące {
  background-color: var(--status-pending);
  color: #fff;
}

.status-do-realizacji {
  background-color: var(--status-in-progress);
  color: #fff;
}

.status-w-realizacji {
  background-color: var(--status-in-progress);
  color: #fff;
}

.status-zrealizowane {
  background-color: var(--status-completed);
  color: #fff;
}

.status-reklamacja {
  background-color: var(--status-rejected);
  color: #fff;
}
</style>

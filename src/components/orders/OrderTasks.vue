<template>
  <div class="order-tasks">
    <label for="task" class="task-label">Szczegóły Zadania</label>
    <input
      type="text"
      id="task"
      v-model="task.details"
      placeholder="Wprowadź szczegóły zadania"
      class="task-input"
      :class="{ 'input-error': !task.details && submitted }"
    />
    <span v-if="!task.details && submitted" class="error-message">Zadanie jest wymagane</span>

    <div class="task-status">
      <label>Status zadania:</label>
      <select v-model="task.status" class="status-select">
        <option value="do realizacji">Do realizacji</option>
        <option value="w realizacji">W realizacji</option>
        <option value="zrealizowane">Zrealizowane</option>
      </select>
    </div>

    <div class="subtask-container">
      <h4 class="subtask-header">Podpunkty zadania</h4>
      <transition-group name="fade" tag="ul" class="subtask-list">
        <li v-for="(subtask, index) in task.subtasks" :key="subtask.id" class="subtask-item">
          <div class="subtask-content">
            <input
              type="text"
              v-model="subtask.name"
              class="subtask-input"
              :placeholder="'Podpunkt ' + (index + 1)"
            />
            <select v-model="subtask.status" class="subtask-status">
              <option value="do realizacji">Do realizacji</option>
              <option value="w realizacji">W realizacji</option>
              <option value="zrealizowane">Zrealizowane</option>
            </select>
            <button @click="removeSubtask(subtask.id)" class="remove-btn" aria-label="Usuń podpunkt">
              <i class="pi pi-trash"></i> Usuń
            </button>
          </div>
        </li>
      </transition-group>
    </div>

    <button @click="addSubtask" class="add-btn" aria-label="Dodaj podpunkt">
      <i class="pi pi-plus"></i> Dodaj Podpunkt
    </button>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    task: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  methods: {
    addSubtask() {
      const newSubtask = {
        id: Date.now(),
        name: '',
        status: 'do realizacji',
      };
      if (!this.task.subtasks) {
        this.$set(this.task, 'subtasks', []);
      }
      this.task.subtasks.push(newSubtask);
    },
    removeSubtask(subtaskId) {
      this.task.subtasks = this.task.subtasks.filter((subtask) => subtask.id !== subtaskId);
    },
  },
};
</script>
<style scoped>
.order-tasks {
  background: var(--card-bg-light);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: var(--box-shadow);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.task-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Stylizacja reszty elementów pozostaje niezmienna */

.task-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.task-input:focus {
  border-color: var(--primary-hover-color);
  box-shadow: 0 0 10px var(--primary-hover-color);
}

.input-error {
  border-color: #ff6b6b;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.task-status {
  margin-bottom: 1.5rem;
}

.status-select {
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid var(--primary-color);
  background: var(--input-bg);
  color: var(--text-color);
  transition: border-color 0.3s ease;
}

.status-select:focus {
  border-color: var(--primary-hover-color);
  box-shadow: 0 0 10px var(--primary-hover-color);
}

.subtask-container {
  margin-top: 2rem;
}

.subtask-header {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.subtask-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subtask-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.subtask-content {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.subtask-input {
  flex: 2;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.subtask-input:focus {
  border-color: var(--primary-hover-color);
  box-shadow: 0 0 10px var(--primary-hover-color);
}

.subtask-status {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid var(--primary-color);
  background: var(--input-bg);
  transition: border-color 0.3s ease;
}

.subtask-status:focus {
  border-color: var(--primary-hover-color);
  box-shadow: 0 0 10px var(--primary-hover-color);
}

.add-btn,
.remove-btn {
  padding: 0.75rem 1.25rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
}

.add-btn i,
.remove-btn i {
  margin-right: 0.5rem;
}

.add-btn:hover,
.remove-btn:hover {
  background-color: var(--primary-hover-color);
  transform: scale(1.05);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

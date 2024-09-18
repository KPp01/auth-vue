<template>
  <div class="thread-manager">
    <h3>AI Conversation Threads</h3>
    <div class="thread-controls">
      <button @click="createNewThread" class="new-thread-btn">
        <i class="fas fa-plus"></i> New Thread
      </button>
      <input v-model="searchQuery" placeholder="Search threads..." class="thread-search" />
    </div>
    <div class="thread-list">
      <div 
        v-for="thread in filteredThreads" 
        :key="thread.id" 
        class="thread-item"
        :class="{ active: thread.id === currentThreadId }"
        @click="selectThread(thread.id)"
      >
        <div class="thread-info">
          <h4>{{ thread.name }}</h4>
          <p>{{ thread.lastMessage | truncate(50) }}</p>
        </div>
        <div class="thread-actions">
          <button @click.stop="renameThread(thread.id)" title="Rename thread">
            <i class="fas fa-edit"></i>
          </button>
          <button @click.stop="deleteThread(thread.id)" title="Delete thread">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    <div v-if="filteredThreads.length === 0" class="no-threads">
      No threads found. Start a new conversation!
    </div>
    <div v-if="showThreadModal" class="thread-modal">
      <div class="modal-content">
        <h4>{{ isEditingThread ? 'Rename Thread' : 'New Thread' }}</h4>
        <input v-model="newThreadName" placeholder="Enter thread name" @keyup.enter="confirmThreadAction" />
        <div class="modal-actions">
          <button @click="confirmThreadAction" :disabled="isProcessing">{{ isProcessing ? 'Processing...' : 'Confirm' }}</button>
          <button @click="cancelThreadAction">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useThreadStore } from '@/stores/threadStore';
import { useToast } from 'vue-toastification';
import debounce from 'lodash/debounce';

export default {
  name: 'ThreadManager',
  props: {
    currentThreadId: {
      type: String,
      default: null
    }
  },
  setup(props, { emit }) {
    const threadStore = useThreadStore();
    const toast = useToast();

    const searchQuery = ref('');
    const showThreadModal = ref(false);
    const newThreadName = ref('');
    const isEditingThread = ref(false);
    const editingThreadId = ref(null);
    const isProcessing = ref(false);

    // Filtruj wątki w zależności od zapytania
    const filteredThreads = computed(() => {
      return threadStore.threads.filter(thread =>
        thread.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // Funkcja do stworzenia nowego wątku
    const createNewThread = () => {
      showThreadModal.value = true;
      isEditingThread.value = false;
      newThreadName.value = '';
    };

    // Funkcja do zmiany nazwy wątku
    const renameThread = (threadId) => {
      showThreadModal.value = true;
      isEditingThread.value = true;
      editingThreadId.value = threadId;
      const thread = threadStore.threads.find(t => t.id === threadId);
      newThreadName.value = thread ? thread.name : '';
    };

    // Funkcja do potwierdzenia akcji (stwórz/zmień nazwę)
    const confirmThreadAction = debounce(async () => {
      if (newThreadName.value.trim() === '' || isProcessing.value) {
        toast.error('Thread name cannot be empty or action already in progress.');
        return;
      }

      isProcessing.value = true;

      try {
        if (isEditingThread.value) {
          await threadStore.renameThread(editingThreadId.value, newThreadName.value);
          toast.success('Thread renamed successfully');
        } else {
          const newThread = await threadStore.createThread(newThreadName.value);
          emit('thread-created', newThread.id);
          toast.success('New thread created');
        }
        showThreadModal.value = false;
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        isProcessing.value = false;
      }
    }, 300);

    // Funkcja do anulowania akcji
    const cancelThreadAction = () => {
      showThreadModal.value = false;
      newThreadName.value = '';
      isEditingThread.value = false;
      editingThreadId.value = null;
    };

    // Funkcja do usunięcia wątku
    const deleteThread = async (threadId) => {
      if (confirm('Are you sure you want to delete this thread?')) {
        try {
          await threadStore.deleteThread(threadId);
          toast.success('Thread deleted successfully');
          if (props.currentThreadId === threadId) {
            emit('thread-changed', null);
          }
        } catch (error) {
          toast.error(`Error deleting thread: ${error.message}`);
        }
      }
    };

    // Funkcja do wybrania wątku
    const selectThread = (threadId) => {
      emit('thread-changed', threadId);
    };

    // Filtr truncate do skracania tekstu
    const truncate = (value, length) => {
      if (!value) return '';
      if (value.length <= length) return value;
      return value.slice(0, length) + '...';
    };

    // Watcher, aby zaktualizować listę wątków po zmianie query
    watch(searchQuery, debounce((newQuery) => {
      console.log('Search updated:', newQuery);
    }, 300));

    return {
      searchQuery,
      filteredThreads,
      showThreadModal,
      newThreadName,
      isEditingThread,
      isProcessing,
      createNewThread,
      renameThread,
      confirmThreadAction,
      cancelThreadAction,
      deleteThread,
      selectThread,
      truncate
    };
  }
};
</script>

<style scoped>
.thread-manager {
  background: #f0f4f8;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.thread-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.new-thread-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.new-thread-btn:hover {
  background: #45a049;
}

.thread-search {
  flex-grow: 1;
  margin-left: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.thread-list {
  max-height: 400px;
  overflow-y: auto;
}

.thread-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.thread-item:hover, .thread-item.active {
  background: #e0e7ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thread-info {
  flex-grow: 1;
}

.thread-info h4 {
  margin: 0;
  font-size: 1.1em;
}

.thread-info p {
  margin: 5px 0 0;
  font-size: 0.9em;
  color: #666;
}

.thread-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  color: #666;
  transition: color 0.3s;
}

.thread-actions button:hover {
  color: #000;
}

.no-threads {
  text-align: center;
  color: #666;
  padding: 20px;
}

.thread-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
}

.modal-content input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.modal-actions button {
  margin-left: 10px;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background: #4caf50;
  color: white;
}

.modal-actions button:last-child {
  background: #f44336;
  color: white;
}
</style>

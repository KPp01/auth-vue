<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="closeOnOverlayClick && close()">
        <div
          ref="overlay"
          class="modal-container"
          :class="sizeClass"
          @click.stop
        >
          <div class="modal-header">
            <h3 :id="titleId">{{ title }}</h3>
            <button
              v-if="showCloseButton"
              class="modal-close"
              aria-label="Close"
              @click="close"
            >
              <span class="sr-only">{{ t('close') }}</span>
              <i class="pi pi-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'Modal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'close'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const overlay = ref(null);
    const titleId = ref(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
    const previousActiveElement = ref(null);

    const sizeClass = computed(() => `modal-${props.size}`);

    const close = () => {
      emit('update:modelValue', false);
      emit('close');
    };

    const handleTabbing = (e) => {
      const focusableElements = overlay.value.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        previousActiveElement.value = document.activeElement;
        nextTick(() => {
          const firstFocusableElement = overlay.value.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusableElement?.focus();
        });
      } else {
        previousActiveElement.value?.focus();
      }
    });

    onMounted(() => {
      if (props.closeOnEsc) {
        const handleEscClose = (event) => {
          if (event.key === 'Escape' && props.modelValue) {
            close();
          }
        };
        document.addEventListener('keydown', handleEscClose);
        onBeforeUnmount(() => {
          document.removeEventListener('keydown', handleEscClose);
        });
      }
      document.addEventListener('keydown', handleTabbing);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleTabbing);
    });

    return {
      overlay,
      titleId,
      sizeClass,
      close,
      t
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--surface-a);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  width: 90%;
  max-width: 600px;
}

.modal-small {
  max-width: 400px;
}

.modal-large {
  max-width: 800px;
}

.modal-full {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  border-radius: 0;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-d);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--surface-d);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--text-color-secondary);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (max-width: 600px) {
  .modal-container {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
}
</style>

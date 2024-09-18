<template>
    <div class="response-viewer" :class="{ 'loading': isLoading }">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loader"></div>
        <p>AI is thinking...</p>
      </div>
      <div v-else-if="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="response" class="response-content">
        <div class="response-header">
          <h3>AI Response</h3>
          <div class="response-actions">
            <button @click="copyToClipboard" title="Copy to clipboard">
              <i class="fas fa-copy"></i>
            </button>
            <button @click="downloadResponse" title="Download response">
              <i class="fas fa-download"></i>
            </button>
            <button @click="toggleFullscreen" title="Toggle fullscreen">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>
        <div class="response-body" ref="responseBody" v-html="formattedResponse"></div>
        <div class="response-footer">
          <p>Generated in {{ processingTime }}ms using {{ modelUsed }}</p>
          <div class="response-feedback">
            <button @click="provideFeedback(true)" title="Thumbs up">👍</button>
            <button @click="provideFeedback(false)" title="Thumbs down">👎</button>
          </div>
        </div>
      </div>
      <div v-else class="no-response">
        <p>No response yet. Try sending a command!</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { marked } from 'marked';
  import { useClipboard } from '@vueuse/core';
  import { useToast } from 'vue-toastification';
  
  export default {
    name: 'ResponseViewer',
    props: {
      response: {
        type: String,
        default: ''
      },
      isLoading: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: ''
      },
      processingTime: {
        type: Number,
        default: 0
      },
      modelUsed: {
        type: String,
        default: 'Unknown Model'
      }
    },
    setup(props) {
      const responseBody = ref(null);
      const toast = useToast();
      const { copy, copied } = useClipboard();
  
      const formattedResponse = computed(() => marked(props.response));
  
      const copyToClipboard = async () => {
        await copy(props.response);
        if (copied.value) {
          toast.success('Response copied to clipboard!');
        } else {
          toast.error('Failed to copy response.');
        }
      };
  
      const downloadResponse = () => {
        const blob = new Blob([props.response], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-response-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
  
      const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
          responseBody.value.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      };
  
      const provideFeedback = (isPositive) => {
        console.log(`User provided ${isPositive ? 'positive' : 'negative'} feedback`);
        toast.info('Thank you for your feedback!');
      };
  
      onMounted(() => {
        watch(() => props.response, () => {
          if (responseBody.value) {
            responseBody.value.querySelectorAll('pre code').forEach((block) => {
              hljs.highlightBlock(block);
            });
          }
        });
      });
  
      return {
        responseBody,
        formattedResponse,
        copyToClipboard,
        downloadResponse,
        toggleFullscreen,
        provideFeedback
      };
    }
  };
  </script>
  
  <style scoped>
  .response-viewer {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
    position: relative;
    overflow: hidden;
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }
  
  .loader {
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  .response-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .response-actions button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2em;
    margin-left: 10px;
    color: #4a90e2;
    transition: color 0.3s ease;
  }
  
  .response-actions button:hover {
    color: #2c3e50;
  }
  
  .response-body {
    max-height: 500px;
    overflow-y: auto;
    padding: 15px;
    background: #f7f9fc;
    border-radius: 5px;
    line-height: 1.6;
  }
  
  .response-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    font-size: 0.9em;
    color: #666;
  }
  
  .response-feedback button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5em;
    margin-left: 10px;
  }
  
  .error-message {
    color: #e74c3c;
    display: flex;
    align-items: center;
    font-weight: bold;
  }
  
  .error-message i {
    margin-right: 10px;
    font-size: 1.5em;
  }
  
  .no-response {
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
  }
  </style>
  
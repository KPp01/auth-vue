i// src/components/modulesAI/CodeHighlighter.js
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Możesz wybrać różne style

export default {
  name: 'CodeHighlighter',
  props: {
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: ''
    },
    autoDetectLanguage: {
      type: Boolean,
      default: true
    }
  },
  render(createElement) {
    let highlightedCode;
    if (this.autoDetectLanguage) {
      highlightedCode = hljs.highlightAuto(this.code).value;
    } else {
      highlightedCode = hljs.highlight(this.language, this.code).value;
    }

    return createElement('pre', {
      class: 'hljs'
    }, [
      createElement('code', {
        domProps: {
          innerHTML: highlightedCode
        }
      })
    ]);
  },
  mounted() {
    // Sprawdzenie, czy element istnieje przed aktualizacją, aby uniknąć niepotrzebnych wywołań
    if (this.code) {
      this.updateLineNumbers();
    }
  },
  updated() {
    // Sprawdzenie, czy nastąpiła rzeczywista zmiana w kodzie, aby uniknąć niepotrzebnych aktualizacji
    if (this.code) {
      this.updateLineNumbers();
    }
  },
  methods: {
    updateLineNumbers() {
      const codeBlock = this.$el.querySelector('code');
      if (codeBlock) {
        const lines = codeBlock.innerHTML.split('\n');
        const numberedLines = lines.map((line, index) => 
          `<span class="line-number">${index + 1}</span>${line}`
        );
        codeBlock.innerHTML = numberedLines.join('\n');
      }
    }
  }
};

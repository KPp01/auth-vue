// src/components/modulesAI/ResponseFormatter.js
import { marked } from 'marked';
import hljs from 'highlight.js';

export function formatResponse(response, format = 'markdown') {
  switch (format) {
    case 'markdown':
      return formatMarkdown(response);
    case 'html':
      return formatHTML(response);
    case 'plain':
      return formatPlainText(response);
    default:
      return response;
  }
}

function formatMarkdown(response) {
  marked.setOptions({
    highlight: function(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-'
  });

  return marked(response);
}

function formatHTML(response) {
  // Convert markdown to HTML and add any additional HTML formatting
  const htmlContent = marked(response);
  return `
    <div class="ai-response">
      ${htmlContent}
    </div>
  `;
}

function formatPlainText(response) {
  // Remove any markdown or HTML formatting
  return response.replace(/[#*_\[\]()]/g, '');
}

export function extractCodeBlocks(response) {
  const codeBlockRegex = /```[\s\S]*?```/g;
  return response.match(codeBlockRegex) || [];
}

export function formatCodeBlock(codeBlock, language) {
  const code = codeBlock.replace(/```/g, '').trim();
  return hljs.highlight(code, { language }).value;
}
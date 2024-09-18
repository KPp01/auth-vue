// src/components/modulesAI/CommandGenerator.js
import { analyzeIntent } from './IntentAnalyzer';
import { getModelCapabilities } from './ModelAnalyzer';

export function generateCommand(baseCommand, options = {}) {
  const intent = analyzeIntent(baseCommand);
  const modelCapabilities = getModelCapabilities(options.model);

  let enhancedCommand = `[INTENT: ${intent}]\n${baseCommand}\n\n`;

  enhancedCommand += `[CONTEXT]\n`;
  enhancedCommand += `- Model: ${options.model}\n`;
  enhancedCommand += `- Max Tokens: ${options.maxTokens}\n`;
  enhancedCommand += `- Temperature: ${options.temperature}\n`;

  if (modelCapabilities.includes('codeGeneration') && intent.includes('code')) {
    enhancedCommand += `\n[CODE GENERATION GUIDELINES]\n`;
    enhancedCommand += `- Use best practices for the target language\n`;
    enhancedCommand += `- Include comments explaining complex logic\n`;
    enhancedCommand += `- Optimize for readability and efficiency\n`;
  }

  if (modelCapabilities.includes('dataAnalysis') && intent.includes('analyze')) {
    enhancedCommand += `\n[DATA ANALYSIS REQUIREMENTS]\n`;
    enhancedCommand += `- Provide statistical summaries where relevant\n`;
    enhancedCommand += `- Include visualizations suggestions if applicable\n`;
    enhancedCommand += `- Highlight key insights and anomalies\n`;
  }

  enhancedCommand += `\n[OUTPUT FORMAT]\n`;
  enhancedCommand += `- Structure the response clearly with headings and subheadings\n`;
  enhancedCommand += `- Use markdown formatting for improved readability\n`;
  enhancedCommand += `- Summarize key points at the end\n`;

  return enhancedCommand;
}
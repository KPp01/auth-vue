// src/components/modulesAI/CommandEnhancer.js
import { analyzeIntent } from '@/utils/intentAnalysis';
import { getModelCapabilities } from '@/utils/modelInfo';

export function enhanceCommand(command, options = {}) {
  const intent = analyzeIntent(command);
  const modelCapabilities = getModelCapabilities(options.model);

  let enhancedCommand = `[ENHANCED COMMAND]\n${command}\n\n`;

  // Dodanie walidacji, aby unikać nadmiarowych operacji
  if (!intent || !modelCapabilities) {
    return enhancedCommand;
  }

  enhancedCommand += `Intent: ${intent}\n`;
  enhancedCommand += `Model: ${options.model}\n`;
  enhancedCommand += `Max Tokens: ${options.maxTokens}\n`;
  enhancedCommand += `Temperature: ${options.temperature}\n\n`;

  if (modelCapabilities.includes('codeGeneration') && intent.includes('code')) {
    enhancedCommand += `[CODE GENERATION GUIDELINES]\n`;
    enhancedCommand += `- Use best practices for the target language\n`;
    enhancedCommand += `- Include comprehensive comments\n`;
    enhancedCommand += `- Optimize for readability and efficiency\n\n`;
  }

  if (modelCapabilities.includes('dataAnalysis') && intent.includes('analyze')) {
    enhancedCommand += `[DATA ANALYSIS REQUIREMENTS]\n`;
    enhancedCommand += `- Provide detailed statistical summaries\n`;
    enhancedCommand += `- Include data visualization suggestions\n`;
    enhancedCommand += `- Highlight key insights and anomalies\n\n`;
  }

  enhancedCommand += `[ADDITIONAL CONTEXT]\n`;
  enhancedCommand += `- Consider recent developments in the field\n`;
  enhancedCommand += `- Provide multiple perspectives if applicable\n`;
  enhancedCommand += `- Suggest follow-up questions or areas for further exploration\n`;

  return enhancedCommand;
}

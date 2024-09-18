// src/components/modulesAI/CommandOptimizer.js
import { tokenize } from './Tokenizer';
import { removeDuplicates } from './TextProcessor';

export function optimizeCommand(command) {
  let optimizedCommand = command;

  // Remove redundant whitespace
  optimizedCommand = optimizedCommand.replace(/\s+/g, ' ').trim();

  // Remove duplicate instructions
  optimizedCommand = removeDuplicates(optimizedCommand);

  // Ensure the command is within token limits
  const tokens = tokenize(optimizedCommand);
  if (tokens.length > 4000) {
    optimizedCommand = truncateToTokenLimit(optimizedCommand, 4000);
  }

  // Add clarity improvements
  optimizedCommand = addClarityImprovements(optimizedCommand);

  return optimizedCommand;
}

function truncateToTokenLimit(command, limit) {
  const tokens = tokenize(command);
  return tokens.slice(0, limit).join(' ');
}

function addClarityImprovements(command) {
  // Add specific clarity improvements based on command content
  // This is a placeholder for more advanced logic
  return `[OPTIMIZED]\n${command}\n[END OPTIMIZED]`;
}
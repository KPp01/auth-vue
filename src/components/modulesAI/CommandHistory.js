// src/components/modulesAI/CommandHistory.js
const MAX_HISTORY_LENGTH = 50;

let commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || [];

export function saveCommand(command, response) {
  const entry = {
    command,
    response,
    date: new Date().toISOString(),
    modelUsed: command.includes('GPT-4') ? 'GPT-4' : 'GPT-3.5-Turbo',
  };

  commandHistory.unshift(entry);

  if (commandHistory.length > MAX_HISTORY_LENGTH) {
    commandHistory = commandHistory.slice(0, MAX_HISTORY_LENGTH);
  }

  localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
}

export function getCommandHistory() {
  return commandHistory;
}

export function clearCommandHistory() {
  commandHistory = [];
  localStorage.removeItem('commandHistory');
}

export function analyzeHistory() {
  const modelUsageStats = commandHistory.reduce((acc, entry) => {
    acc[entry.modelUsed] = (acc[entry.modelUsed] || 0) + 1;
    return acc;
  }, {});

  return {
    totalCommands: commandHistory.length,
    modelUsageStats,
    commandHistory,
  };
}

// src/components/modulesAI/CommandEvaluator.js
import { tokenize } from '@/utils/tokenizer';
import { analyzeComplexity } from '@/utils/complexityAnalysis';

export function evaluateCommand(command, model) {
  const tokens = tokenize(command); // Tokenizacja komendy
  const complexity = analyzeComplexity(command); // Analiza złożoności komendy

  // Utworzenie obiektu oceny komendy
  const evaluation = {
    tokenCount: tokens.length, // Liczba tokenów
    complexity: complexity, // Złożoność komendy (np. 'Low', 'Medium', 'High')
    suitability: calculateSuitability(tokens.length, complexity, model), // Ocena dopasowania do modelu
    suggestions: [] // Lista sugestii dotyczących polecenia
  };

  // Dodano ograniczenia tokenów na początku, aby uniknąć dalszych niepotrzebnych operacji
  if (evaluation.tokenCount > getModelMaxTokens(model)) {
    evaluation.suggestions.push('Consider shortening the command to fit within model token limits.');
    return evaluation;
  }

  // Sugestie związane z wyborem modelu na podstawie złożoności komendy
  if (evaluation.complexity === 'Low' && model.includes('gpt-4')) {
    evaluation.suggestions.push('This command might be better suited for a simpler model like GPT-3.5-turbo.');
  }

  if (evaluation.complexity === 'High' && !model.includes('gpt-4')) {
    evaluation.suggestions.push('Consider using a more advanced model like GPT-4 for this complex query.');
  }

  return evaluation;
}

// Funkcja do obliczania dopasowania polecenia do modelu
function calculateSuitability(tokenCount, complexity, model) {
  const maxTokens = getModelMaxTokens(model); // Pobieranie maksymalnej liczby tokenów dla modelu
  let suitability = 1; // Domyślna wartość dopasowania

  // Obniżanie dopasowania na podstawie liczby tokenów
  if (tokenCount > maxTokens * 0.75) {
    suitability *= 0.75; // Jeśli tokeny przekraczają 75% limitu, obniżenie oceny
  } else if (tokenCount > maxTokens * 0.5) {
    suitability *= 0.85; // Jeśli tokeny przekraczają 50% limitu, lekkie obniżenie oceny
  }

  // Obniżanie dopasowania na podstawie złożoności
  if (complexity === 'High' && !model.includes('gpt-4')) {
    suitability *= 0.5; // Jeśli złożoność wysoka, a model nie jest GPT-4, znaczące obniżenie oceny
  } else if (complexity === 'Low' && model.includes('gpt-4')) {
    suitability *= 0.8; // Jeśli złożoność niska, a model to GPT-4, lekkie obniżenie oceny
  }

  return suitability; // Zwracanie wartości dopasowania
}

// Funkcja do pobierania maksymalnej liczby tokenów dla modelu
function getModelMaxTokens(model) {
  // Definiowanie maksymalnych tokenów dla popularnych modeli
  const modelLimits = {
    'gpt-4': 8000,
    'gpt-3.5-turbo': 4096,
    'gpt-3': 2048,
    'gpt-2': 1024,
  };

  // Zwracanie limitu dla danego modelu lub domyślnego 2048
  return modelLimits[model] || 2048;
}


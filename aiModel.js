import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

// Inicjalizacja OpenAI z kluczem API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Funkcja do wysyłania zapytań do OpenAI
export async function callOpenAI(prompt, model = 'gpt-4', maxTokens = 1000, temperature = 0.7) {
  try {
    // Wyślij zapytanie do OpenAI
    const { choices, usage } = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    // Zwróć odpowiedź i informacje o użyciu tokenów
    return {
      success: true,
      response: choices[0].message.content,
      usage,
    };
  } catch (error) {
    console.error('Błąd podczas komunikacji z OpenAI:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Funkcja do analizy jednego pliku
export async function analyzeSingleFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const prompt = `Przeanalizuj poniższy kod w pliku ${filePath}:\n\n${fileContent}`;
    return await callOpenAI(prompt);
  } catch (error) {
    console.error(`Błąd podczas analizy pliku ${filePath}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Funkcja do analizy wielu plików
export async function analyzeFilesWithAI(filePaths) {
  const results = await Promise.all(filePaths.map(analyzeSingleFile));
  return results;
}

// Funkcja do analizowania struktury folderów
export async function analyzeProjectStructure(directory) {
  try {
    const fileNames = await fs.readdir(directory, { withFileTypes: true });
    const analysisPromises = fileNames.map(async (file) => {
      const fullPath = path.join(directory, file.name);
      if (file.isDirectory()) {
        return analyzeProjectStructure(fullPath);
      } else if (['.js', '.vue', '.css', '.html', '.json'].includes(path.extname(file.name))) {
        return analyzeSingleFile(fullPath);
      }
    });
    return (await Promise.all(analysisPromises)).flat();
  } catch (error) {
    console.error('Błąd podczas analizy struktury projektu:', error.message);
    return { success: false, error: error.message };
  }
}

// Funkcja pomocnicza do zapisywania wyników analizy
export async function logAnalysisResults(results, outputFilePath = 'analysis_results.json') {
  try {
    await fs.writeFile(outputFilePath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Wyniki analizy zapisane w pliku: ${outputFilePath}`);
  } catch (error) {
    console.error('Błąd podczas zapisywania wyników analizy:', error.message);
  }
}

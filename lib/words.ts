// lib/words.ts — словарь и выбор слова дня без базы данных
import wordsData from '../prisma/words.json';

const words: string[] = wordsData.words;

// Набор слов для быстрой проверки
const wordSet = new Set(words.map(w => w.toLowerCase()));

/**
 * Проверяет, есть ли слово в словаре
 */
export function isValidWord(word: string): boolean {
  return wordSet.has(word.toLowerCase());
}

/**
 * Детерминированный выбор слова дня по дате.
 * Использует тот же алгоритм Fisher-Yates с seed, что и seed.cjs,
 * но проще — просто берём индекс из хеша даты.
 */
export function getDailyWord(date: Date): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  // Простой хеш строки даты для детерминированного выбора
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % words.length;
  return words[index];
}

/**
 * Возвращает все слова словаря
 */
export function getAllWords(): string[] {
  return words;
}

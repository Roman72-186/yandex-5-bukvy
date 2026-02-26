// services/gameService.ts
import { isValidWord as checkWord, getDailyWord } from '../lib/words';
import { GAME_CONFIG, WordResult, CELL_STATUS } from '../lib/constants';
import { z } from 'zod';

/**
 * Получает слово дня для конкретной даты.
 */
export function getDailyWordForDate(date: Date): { word: string } {
  return { word: getDailyWord(date) };
}

/**
 * Проверяет, является ли слово допустимым (существует в словаре).
 */
export function isValidWord(word: string): boolean {
  if (word.length !== GAME_CONFIG.WORD_LENGTH) {
    return false;
  }
  return checkWord(word);
}

/**
 * Вычисляет результат проверки слова.
 */
export function calculateGuessResult(guess: string, target: string): WordResult {
  if (guess.length !== GAME_CONFIG.WORD_LENGTH || target.length !== GAME_CONFIG.WORD_LENGTH) {
    throw new Error(`Invalid word length. Expected ${GAME_CONFIG.WORD_LENGTH} letters.`);
  }

  const guessLower = guess.toLowerCase();
  const targetLower = target.toLowerCase();

  const targetLetters = targetLower.split('');
  const result: WordResult = Array(GAME_CONFIG.WORD_LENGTH).fill(null).map(() => ({ letter: '', status: CELL_STATUS.EMPTY }));

  // Первый проход: точные совпадения (CORRECT)
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    if (guessLower[i] === targetLower[i]) {
      result[i] = { letter: guess[i], status: CELL_STATUS.CORRECT };
      targetLetters[i] = '';
    }
  }

  // Второй проход: буквы на неправильной позиции (PRESENT) или отсутствующие (ABSENT)
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    if (result[i].status === CELL_STATUS.CORRECT) {
      continue;
    }

    const letter = guessLower[i];
    const indexInTarget = targetLetters.indexOf(letter);
    if (indexInTarget !== -1) {
      result[i] = { letter: guess[i], status: CELL_STATUS.PRESENT };
      targetLetters[indexInTarget] = '';
    } else {
      result[i] = { letter: guess[i], status: CELL_STATUS.ABSENT };
    }
  }

  return result;
}

/**
 * Валидирует входные данные для попытки угадывания.
 */
export const GuessInputSchema = z.object({
  word: z.string().min(GAME_CONFIG.WORD_LENGTH).max(GAME_CONFIG.WORD_LENGTH).regex(/^[a-zA-Zа-яА-Я]+$/, "Word must contain only letters"),
});

/**
 * Обрабатывает попытку угадывания слова.
 */
export function processGuess(word: string, target: string): {
  isValid: boolean;
  result?: WordResult;
  error?: string;
} {
  try {
    const validatedInput = GuessInputSchema.parse({ word });

    const wordExists = isValidWord(validatedInput.word);
    if (!wordExists) {
      return {
        isValid: false,
        error: 'Слово не найдено в словаре'
      };
    }

    const result = calculateGuessResult(validatedInput.word, target);

    return {
      isValid: true,
      result: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: `Validation error: ${error.issues.map(i => i.message).join(', ')}`
      };
    }
    const errorMessage = (error as Error)?.message ?? 'Failed to process guess';
    return {
      isValid: false,
      error: errorMessage
    };
  }
}

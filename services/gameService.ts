// services/gameService.ts
import { prisma } from '../lib/prisma';
import { GAME_CONFIG, LetterResult, WordResult, CELL_STATUS } from '../lib/constants';
import { z } from 'zod';

/**
 * Получает слово дня для конкретной даты.
 * @param date Дата в формате YYYY-MM-DD.
 * @returns Promise, который резолвится в объект DailyWord или null, если слово не найдено.
 */
export async function getDailyWordForDate(date: Date): Promise<{ word: string } | null> {
  try {
    // Преобразуем дату в формат 'YYYY-MM-DD' для поиска
    const dateStr = date.toISOString().split('T')[0];

    const dailyWordRecord = await prisma.dailyWord.findUnique({
      where: {
        date: new Date(dateStr),
      },
      include: {
        word: true, // Включаем связанный объект WordDictionary
      },
    });

    if (!dailyWordRecord) {
      console.log(`Daily word for date ${dateStr} not found.`);
      return null;
    }

    console.log(`Retrieved daily word for ${dateStr}: ${dailyWordRecord.word.word}`);
    return { word: dailyWordRecord.word.word };
  } catch (error) {
    console.error('Error fetching daily word from database:', error);
    throw new Error('Failed to retrieve daily word');
  }
}


/**
 * Проверяет, является ли слово допустимым (существует в словаре).
 * @param word Проверяемое слово.
 * @returns Promise, который резолвится в boolean.
 */
export async function isValidWord(word: string): Promise<boolean> {
  // Валидация длины слова
  if (word.length !== GAME_CONFIG.WORD_LENGTH) {
    return false;
  }

  // Проверка в базе данных
  try {
    const foundWord = await prisma.wordDictionary.findUnique({
      where: { word: word.toLowerCase() },
    });

    const isValid = !!foundWord;
    console.log(`Word "${word}" validity check: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error(`Error checking word validity for "${word}":`, error);
    throw new Error('Failed to validate word');
  }
}

/**
 * Вычисляет результат проверки слова.
 * @param guess Слово, введенное пользователем.
 * @param target Слово, которое нужно угадать.
 * @returns Массив LetterResult, описывающий статус каждой буквы.
 */
export function calculateGuessResult(guess: string, target: string): WordResult {
  if (guess.length !== GAME_CONFIG.WORD_LENGTH || target.length !== GAME_CONFIG.WORD_LENGTH) {
    throw new Error(`Invalid word length. Expected ${GAME_CONFIG.WORD_LENGTH} letters.`);
  }

  const guessLower = guess.toLowerCase();
  const targetLower = target.toLowerCase();

  // Создаем копию целевого слова в виде массива символов для отслеживания использованных букв
  const targetLetters = targetLower.split('');
  const result: WordResult = Array(GAME_CONFIG.WORD_LENGTH).fill(null).map(() => ({ letter: '', status: CELL_STATUS.EMPTY }));

  // Первый проход: помечаем точные совпадения (CORRECT)
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    if (guessLower[i] === targetLower[i]) {
      result[i] = { letter: guess[i], status: CELL_STATUS.CORRECT };
      targetLetters[i] = ''; // Помечаем букву как использованную
    }
  }

  // Второй проход: помечаем буквы, которые есть в слове, но на других местах (PRESENT)
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    if (result[i].status === CELL_STATUS.CORRECT) {
      continue; // Пропускаем уже помеченные как CORRECT
    }

    const letter = guessLower[i];
    const indexInTarget = targetLetters.indexOf(letter);
    if (indexInTarget !== -1) {
      result[i] = { letter: guess[i], status: CELL_STATUS.PRESENT };
      targetLetters[indexInTarget] = ''; // Помечаем букву как использованную
    } else {
      result[i] = { letter: guess[i], status: CELL_STATUS.ABSENT }; // Ни в одном месте не найдена
    }
  }

  console.log(`Calculated result for guess "${guess}" vs target "${target}":`, result);
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
 * @param word Слово, введенное пользователем.
 * @param targetDate Дата, для которой проверяется слово (по умолчанию - сегодня).
 * @returns Promise, который резолвится в объект с результатом.
 */
export async function processGuess(word: string, targetDate: Date = new Date()): Promise<{
  isValid: boolean;
  result?: WordResult;
  error?: string;
}> {
  try {
    // 1. Валидация входных данных
    const validatedInput = GuessInputSchema.parse({ word });

    // 2. Проверка, является ли слово допустимым (есть в базе)
    const wordExists = await isValidWord(validatedInput.word);
    if (!wordExists) {
      return {
        isValid: false,
        error: 'Слово не найдено в словаре'
      };
    }

    // 3. Получение слова дня
    const dailyWordObj = await getDailyWordForDate(targetDate);
    if (!dailyWordObj) {
      throw new Error(`No daily word found for date ${targetDate.toISOString().split('T')[0]}`);
    }
    const targetWord = dailyWordObj.word;

    // 4. Вычисление результата
    const result = calculateGuessResult(validatedInput.word, targetWord);

    // 5. Логика победы/поражения (опционально, можно обработать на клиенте)
    const isWin = result.every(r => r.status === CELL_STATUS.CORRECT);

    console.log(`Guess "${validatedInput.word}" processed. Win: ${isWin}`);
    return {
      isValid: true,
      result: result,
      // win: isWin // Можно вернуть флаг победы
    };

  } catch (error) {
    console.error('Error processing guess:', error);
    if (error instanceof z.ZodError) {
      // Используем .issues вместо .errors для Zod v3+
      return {
        isValid: false,
        error: `Validation error: ${error.issues.map(i => i.message).join(', ')}`
      };
    }
    // Явно указываем тип для error, если он не ZodError
    const errorMessage = (error as Error)?.message ?? 'Failed to process guess';
    return {
      isValid: false,
      error: errorMessage
    };
  }
}
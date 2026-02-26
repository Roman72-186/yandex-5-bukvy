// lib/constants.ts

export const GAME_CONFIG = {
  WORD_LENGTH: 5,
  MAX_ATTEMPTS: 6,
  LANGUAGE: 'ru' as const, // 'ru' for Russian
};

export const CELL_STATUS = {
  CORRECT: 'correct',      // Буква на своём месте (зелёная)
  PRESENT: 'present',      // Буква есть, но не на своём месте (жёлтая)
  ABSENT: 'absent',        // Буквы нет в слове (серая)
  EMPTY: 'empty',          // Пустая ячейка
  UNCHECKED: 'unchecked',  // Ячейка, которая ещё не проверена
} as const;

// Тип для статуса ячейки
export type CellStatus = typeof CELL_STATUS[keyof typeof CELL_STATUS];

// Цвета для отображения (inline CSS values для совместимости с Tailwind v4)
export const CELL_COLORS: Record<CellStatus, string> = {
  [CELL_STATUS.CORRECT]: '#22c55e',
  [CELL_STATUS.PRESENT]: '#eab308',
  [CELL_STATUS.ABSENT]: '#6b7280',
  [CELL_STATUS.EMPTY]: '#ffffff',
  [CELL_STATUS.UNCHECKED]: '#e5e7eb',
};

// Цвета текста
export const CELL_TEXT_COLORS: Record<CellStatus, string> = {
  [CELL_STATUS.CORRECT]: '#ffffff',
  [CELL_STATUS.PRESENT]: '#ffffff',
  [CELL_STATUS.ABSENT]: '#ffffff',
  [CELL_STATUS.EMPTY]: '#000000',
  [CELL_STATUS.UNCHECKED]: '#000000',
};

// Тип для результата проверки одной буквы
export interface LetterResult {
  letter: string;
  status: CellStatus;
}

// Тип для результата проверки всего слова
export type WordResult = LetterResult[];

// Тип для хода игрока
export interface GuessAttempt {
  word: string;
  result: WordResult;
}
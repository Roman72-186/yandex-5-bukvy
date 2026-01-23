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

// Цвета для отображения
export const CELL_COLORS = {
  [CELL_STATUS.CORRECT]: 'bg-green-500',
  [CELL_STATUS.PRESENT]: 'bg-yellow-500',
  [CELL_STATUS.ABSENT]: 'bg-gray-500',
  [CELL_STATUS.EMPTY]: 'bg-white',
  [CELL_STATUS.UNCHECKED]: 'bg-gray-200',
} as const;

// Тип для цвета ячейки
export type CellColor = typeof CELL_COLORS[CellStatus];

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
// components/ui/Grid.tsx
import React from 'react';
import { CELL_STATUS, LetterResult, CELL_COLORS } from '../../lib/constants';
import clsx from 'clsx';

interface GridProps {
  guesses: LetterResult[][]; // Массив массивов результатов для каждого слова
  currentGuess: string; // Текущее слово, вводимое пользователем
  maxLength: number; // Максимальная длина слова (например, 5)
}

const Grid: React.FC<GridProps> = ({ guesses, currentGuess, maxLength }) => {
  // Максимальное количество строк (попыток)
  const maxRows = 6;

  // Создаем 6 строк (попыток)
  const rows = Array.from({ length: maxRows }, (_, rowIndex) => {
    // Каждая строка - массив из 5 ячеек
    return Array.from({ length: maxLength }, (_, cellIndex) => {
      let letter = '';
      let status: typeof CELL_STATUS[keyof typeof CELL_STATUS] = CELL_STATUS.UNCHECKED;

      // Если это строка с уже сделанным предположением
      if (rowIndex < guesses.length) {
        const row = guesses[rowIndex];
        if (cellIndex < row.length) {
          letter = row[cellIndex].letter;
          status = row[cellIndex].status;
        }
      } else if (rowIndex === guesses.length && guesses.length < maxRows) {
        // Если это текущая строка, в которую вводим
        letter = currentGuess[cellIndex] || '';
        // Если guess ещё не проверен, ячейки остаются серыми (UNCHECKED) или пустыми
        // В данном случае, если буква есть в currentGuess, но строка не отправлена,
        // мы можем показать её как пустую или с другим статусом, но обычно это просто ввод.
        // Пусть пока будет UNECHECKED, если слово не отправлено.
        // status = letter ? CELL_STATUS.UNCHECKED : CELL_STATUS.EMPTY; // Или EMPTY
        // Для визуального отображения ввода, можно использовать UNECHECKED или даже EMPTY.
        // Пусть будет EMPTY для пустых и UNECHECKED для введённых, но не проверенных.
        status = letter ? CELL_STATUS.UNCHECKED : CELL_STATUS.EMPTY;
      } else {
        // Если строка не используется, ячейки пустые
        status = CELL_STATUS.EMPTY;
      }

      const bgColor = CELL_COLORS[status];

      return (
        <div
          key={`${rowIndex}-${cellIndex}`}
          className={clsx(
            'flex items-center justify-center border border-gray-300 font-bold text-2xl rounded-md',
            bgColor,
            'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', // Адаптивный размер
            {
              'border-2 border-black': status === CELL_STATUS.UNCHECKED, // Выделение активной ячейки
            }
          )}
        >
          {letter.toUpperCase()}
        </div>
      );
    });
  });

  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {rows.flat().map((cell, index) => (
        // Используем flat() для преобразования 2D массива в 1D для рендеринга в div
        // Важно: ключ должен быть уникальным. index может быть не идеальным, но подойдет для фиксированной сетки.
        // Лучше использовать строку вроде `${rowIndex}-${cellIndex}`, но для flat() это сложнее.
        // Так как rows - это массив JSX элементов, а не данных, я переделаю структуру.
        // Лучше всего рендерить 2D массив напрямую.
        <React.Fragment key={index}>{cell}</React.Fragment>
      ))}
    </div>
  );
};

// Альтернативный рендеринг 2D сетки
const Grid2D: React.FC<GridProps> = ({ guesses, currentGuess, maxLength }) => {
  const maxRows = 6;

  const renderRow = (rowIndex: number) => {
    const cells = Array.from({ length: maxLength }, (_, cellIndex) => {
      let letter = '';
      let status: typeof CELL_STATUS[keyof typeof CELL_STATUS] = CELL_STATUS.UNCHECKED;

      if (rowIndex < guesses.length) {
        const row = guesses[rowIndex];
        if (cellIndex < row.length) {
          letter = row[cellIndex].letter;
          status = row[cellIndex].status;
        }
      } else if (rowIndex === guesses.length && guesses.length < maxRows) {
        letter = currentGuess[cellIndex] || '';
        status = letter ? CELL_STATUS.UNCHECKED : CELL_STATUS.EMPTY;
      } else {
        status = CELL_STATUS.EMPTY;
      }

      const bgColor = CELL_COLORS[status];

      return (
        <div
          key={`cell-${rowIndex}-${cellIndex}`}
          className={clsx(
            'flex items-center justify-center border border-gray-300 font-bold text-2xl rounded-md',
            bgColor,
            'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20',
            {
              'border-2 border-black': status === CELL_STATUS.UNCHECKED,
            }
          )}
        >
          {letter.toUpperCase()}
        </div>
      );
    });

    return (
      <div key={`row-${rowIndex}`} className="flex gap-2 mb-1">
        {cells}
      </div>
    );
  };

  const rows = Array.from({ length: maxRows }, (_, i) => renderRow(i));

  return <div className="mb-4">{rows}</div>;
};

// Экспортируем компонент с 2D рендером
export default Grid2D;
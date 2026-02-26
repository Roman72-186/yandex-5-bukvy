'use client';

import React from 'react';
import { CELL_STATUS, CELL_COLORS, CELL_TEXT_COLORS, LetterResult, CellStatus } from '../../lib/constants';

interface GridProps {
  guesses: LetterResult[][];
  currentGuess: string;
  maxLength: number;
}

const Grid: React.FC<GridProps> = ({ guesses, currentGuess, maxLength }) => {
  const maxRows = 6;

  const renderCell = (rowIndex: number, cellIndex: number) => {
    let letter = '';
    let status: CellStatus = CELL_STATUS.EMPTY;

    if (rowIndex < guesses.length) {
      const row = guesses[rowIndex];
      if (cellIndex < row.length) {
        letter = row[cellIndex].letter;
        status = row[cellIndex].status;
      }
    } else if (rowIndex === guesses.length && guesses.length < maxRows) {
      letter = currentGuess[cellIndex] || '';
      status = letter ? CELL_STATUS.UNCHECKED : CELL_STATUS.EMPTY;
    }

    const bgColor = CELL_COLORS[status];
    const textColor = CELL_TEXT_COLORS[status];

    return (
      <div
        key={`cell-${rowIndex}-${cellIndex}`}
        className="flex items-center justify-center border-2 font-bold text-2xl rounded-md w-14 h-14 sm:w-16 sm:h-16"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderColor: status === CELL_STATUS.UNCHECKED ? '#000000' : '#d1d5db',
        }}
      >
        {letter.toUpperCase()}
      </div>
    );
  };

  return (
    <div className="mb-4">
      {Array.from({ length: maxRows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-1 mb-1 justify-center">
          {Array.from({ length: maxLength }, (_, cellIndex) =>
            renderCell(rowIndex, cellIndex)
          )}
        </div>
      ))}
    </div>
  );
};

export default Grid;

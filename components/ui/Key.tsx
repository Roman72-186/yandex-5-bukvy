'use client';

import React from 'react';
import { CELL_COLORS, CELL_TEXT_COLORS, CellStatus } from '../../lib/constants';

interface KeyProps {
  char: string;
  onClick: () => void;
  disabled?: boolean;
  status?: CellStatus;
  wide?: boolean;
}

const Key: React.FC<KeyProps> = ({ char, onClick, disabled = false, status, wide = false }) => {
  const bgColor = status ? CELL_COLORS[status] : '#e5e7eb';
  const textColor = status ? CELL_TEXT_COLORS[status] : '#000000';

  return (
    <button
      className={
        wide
          ? 'flex items-center justify-center rounded-md border-2 border-blue-400 font-bold text-sm sm:text-base min-w-[56px] h-12 sm:min-w-[72px] sm:h-14 px-2 transition-colors duration-200 select-none'
          : 'flex items-center justify-center rounded-md border border-gray-300 font-bold text-base sm:text-lg min-w-[32px] h-12 sm:min-w-[40px] sm:h-14 px-1 transition-colors duration-200 select-none'
      }
      style={{
        backgroundColor: wide ? '#3b82f6' : bgColor,
        color: wide ? '#ffffff' : textColor,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Key ${char}`}
    >
      {char}
    </button>
  );
};

export default Key;

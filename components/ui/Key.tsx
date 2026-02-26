'use client';

import React, { useCallback, useRef } from 'react';
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
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    // Вибрация
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    onClick();
  }, [onClick]);

  return (
    <button
      ref={btnRef}
      className="key-btn flex items-center justify-center rounded-md border border-gray-300 font-bold h-12 sm:h-14 select-none"
      style={{
        flex: wide ? 1.5 : 1,
        minWidth: 0,
        fontSize: wide ? '0.75rem' : undefined,
        backgroundColor: wide ? '#6b7280' : bgColor,
        color: wide ? '#ffffff' : textColor,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Key ${char}`}
    >
      {char}
    </button>
  );
};

export default Key;

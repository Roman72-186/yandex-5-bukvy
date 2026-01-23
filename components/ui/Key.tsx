// components/ui/Key.tsx
import React from 'react';
import { CELL_COLORS, CellStatus } from '../../lib/constants';
import clsx from 'clsx'; // Используем clsx для удобного объединения классов

interface KeyProps {
  char: string;
  onClick: () => void;
  disabled?: boolean;
 status?: CellStatus; // Статус для изменения цвета
}

const Key: React.FC<KeyProps> = ({ char, onClick, disabled = false, status }) => {
  const bgColor = status ? CELL_COLORS[status] : 'bg-gray-200';
  const hoverBgColor = status ? CELL_COLORS[status] : 'hover:bg-gray-300';

  return (
    <button
      className={clsx(
        'flex items-center justify-center rounded-md border border-gray-300 font-bold text-lg w-12 h-12 transition-colors duration-200',
        bgColor,
        hoverBgColor,
        {
          'opacity-50 cursor-not-allowed': disabled,
          'active:scale-95': !disabled, // Анимация нажатия
        }
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Key ${char}`}
    >
      {char}
    </button>
  );
};

export default Key;
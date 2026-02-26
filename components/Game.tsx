'use client';

import React, { useState, useEffect } from 'react';
import Grid from './ui/Grid';
import Key from './ui/Key';
import Modal from './ui/Modal';
import { CELL_STATUS } from '../lib/constants';
import { useWordle } from '../hooks/useWordle'; // Импортируем хук
declare global {
  interface Window {
    Telegram?: {
      sendData: (data: string) => void;
    };
  }
}

const Game: React.FC = () => {
  const {
    currentGuess,
    guesses,
    gameOver,
    gameWon,
    targetWord,
    message,
    showModal, // Новое состояние из хука
    closeModal, // Новый метод из хука
    setMessage,
    handleChar,
    handleDelete,
    handleSubmit,
    resetGame,
    loading, // Новое состояние из хука
  } = useWordle();

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState('');

  const handleShowShareModal = () => {
    // Генерируем текст для шаринга
    const resultEmojis = guesses.map((row) => // Типизация из constants.ts
      row.map((cell) => { // Типизация из constants.ts
        if (cell.status === CELL_STATUS.CORRECT) return '🟩';
        if (cell.status === CELL_STATUS.PRESENT) return '🟨';
        return '⬜';
      }).join('')
    ).join('\n');

    const shareText = `5Букв ${guesses.length}/${guesses.length}\n${resultEmojis}`;
    setShareText(shareText);
    setShowShareModal(true);
  };

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(shareText);
    alert('Результат скопирован в буфер обмена!');
  };

  // Отправляем результат в Telegram при завершении игры
  useEffect(() => {
    if (gameOver && window.Telegram) {
      const payload = {
        type: 'game_end',
        status: gameWon ? 'win' : 'fail',
        word: targetWord,
        attempt: guesses.length,
      };
      window.Telegram.sendData(JSON.stringify(payload));
      console.log('Sent game result to Telegram:', payload);
    }
  }, [gameOver, gameWon, targetWord, guesses.length]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>;
  }

  // const handleCloseMessageModal = () => {
  //   setMessage(''); // Закрываем модалку, очищая сообщение
  // };
  // Заменяем на closeModal из хука
  const handleCloseMessageModal = closeModal;

  // Клавиши для виртуальной клавиатуры (русские)
  const keyboardRows = [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    ['Enter', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'Backspace'], // Enter и Backspace
 ];

  const getKeyStatus = (key: string): typeof CELL_STATUS[keyof typeof CELL_STATUS] => {
    if (key === 'Enter' || key === 'Backspace') return CELL_STATUS.UNCHECKED;

    let best: typeof CELL_STATUS[keyof typeof CELL_STATUS] = CELL_STATUS.UNCHECKED;

    for (const row of guesses) {
      for (const cell of row) {
        if (cell.letter.toLowerCase() === key) {
          if (cell.status === CELL_STATUS.CORRECT) return CELL_STATUS.CORRECT;
          if (cell.status === CELL_STATUS.PRESENT) best = CELL_STATUS.PRESENT;
          if (cell.status === CELL_STATUS.ABSENT && best === CELL_STATUS.UNCHECKED) best = CELL_STATUS.ABSENT;
        }
      }
    }

    return best;
  };

  const handleKeyPress = (key: string) => {
    if (gameOver) return;

    if (key === 'Enter') {
      handleSubmit();
    } else if (key === 'Backspace') {
      handleDelete();
    } else if (/^[а-яё]$/i.test(key)) { // Проверяем, является ли это русской буквой
      handleChar(key);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">5Букв</h1>
      <Grid guesses={guesses} currentGuess={currentGuess} maxLength={5} />

      {/* Клавиатура */}
      <div className="flex flex-col gap-1 w-full max-w-md">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => (
              <Key
                key={key}
                char={key === 'Backspace' ? '⌫' : key === 'Enter' ? 'ВВОД' : key}
                onClick={() => handleKeyPress(key)}
                status={getKeyStatus(key.toLowerCase())}
                disabled={gameOver}
                wide={key === 'Enter' || key === 'Backspace'}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Кнопка "Поделиться" появляется после окончания игры */}
      {gameOver && (
        <button
          onClick={handleShowShareModal}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Поделиться результатом
        </button>
      )}

      <button
        onClick={resetGame}
        className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Играть снова
      </button>

      {/* Модальное окно для сообщений */}
      {/* isOpen теперь зависит от showModal из хука, onClose использует closeModal из хука */}
      <Modal isOpen={showModal} onClose={handleCloseMessageModal} title="Сообщение">
        <p>{message}</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCloseMessageModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Модальное окно для шаринга */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Поделиться результатом">
        <pre className="whitespace-pre-wrap break-words">{shareText}</pre>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setShowShareModal(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Закрыть
          </button>
          <button
            onClick={handleCopyShareText}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Скопировать
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Game;
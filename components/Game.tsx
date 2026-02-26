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
    ['Enter', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'Backspace'],
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

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--button-color)',
    color: 'var(--button-text-color)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'var(--hint-color)',
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-lg mx-auto">
      <h1
        className="text-3xl font-bold mb-4 px-6 py-2 rounded-xl select-none"
        style={{
          background: 'linear-gradient(135deg, #c9a84c 0%, #e8d48b 50%, #c9a84c 100%)',
          color: '#1a1a2e',
          boxShadow: '0 4px 15px rgba(201, 168, 76, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
          letterSpacing: '0.05em',
          textShadow: '0 1px 0 rgba(255,255,255,0.2)',
          border: '1px solid rgba(201, 168, 76, 0.5)',
        }}
      >
        5Букв
      </h1>
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

      {/* Кнопки после игры */}
      {gameOver && (
        <div className="flex flex-col items-center gap-2 mt-3 w-full max-w-md">
          <button
            className="key-btn w-full h-[48px] sm:h-[52px] rounded-md font-bold text-base sm:text-lg select-none"
            style={{
              backgroundColor: '#c9a84c',
              color: '#1a1a2e',
              border: '2px solid #d4b85c',
              cursor: 'pointer',
            }}
            onClick={resetGame}
          >
            ИГРАТЬ СНОВА
          </button>
          <button onClick={handleShowShareModal} style={{ ...buttonStyle, width: '100%' }}>
            Поделиться результатом
          </button>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseMessageModal} title="Сообщение">
        <p>{message}</p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleCloseMessageModal} style={buttonStyle}>
            OK
          </button>
        </div>
      </Modal>

      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Поделиться результатом">
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{shareText}</pre>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={() => setShowShareModal(false)} style={secondaryButtonStyle}>
            Закрыть
          </button>
          <button onClick={handleCopyShareText} style={buttonStyle}>
            Скопировать
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Game;
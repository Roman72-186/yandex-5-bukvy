import { useState, useEffect, useCallback } from 'react';
import { WordResult, CELL_STATUS, GAME_CONFIG } from '../lib/constants';

interface MessageState {
  text: string;
  isVisible: boolean;
}

export const useWordle = () => {
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<WordResult[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [targetWord, setTargetWord] = useState<string>('');
  const [message, setMessageState] = useState<MessageState>({ text: '', isVisible: false });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTargetWord = useCallback(async () => {
    try {
      const response = await fetch('/api/daily-word');
      if (!response.ok) {
        throw new Error('Failed to fetch daily word');
      }
      const data = await response.json();
      setTargetWord(data.word);
      setLoading(false);
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setMessageState({ text: 'Ошибка загрузки игры. Попробуйте обновить страницу.', isVisible: true });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargetWord();
  }, [fetchTargetWord]);

  const handleChar = useCallback((char: string) => {
    if (currentGuess.length < GAME_CONFIG.WORD_LENGTH && !gameOver) {
      setCurrentGuess(prev => prev + char);
    }
  }, [currentGuess.length, gameOver]);

  const handleDelete = useCallback(() => {
    setCurrentGuess(prev => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (currentGuess.length !== GAME_CONFIG.WORD_LENGTH) {
      setMessageState({ text: 'Слово должно быть 5 букв', isVisible: true });
      setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 2000);
      return;
    }

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentGuess }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageState({ text: data.error || 'Неверное слово', isVisible: true });
        setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 2000);
        return;
      }

      const resultFromServer: WordResult = data.result;
      setGuesses(prev => [...prev, resultFromServer]);

      const isWon = resultFromServer.every(cell => cell.status === CELL_STATUS.CORRECT);
      if (isWon) {
        setGameWon(true);
        setGameOver(true);
        setMessageState({ text: 'Поздравляем! Вы угадали!', isVisible: true });
        return;
      }

      if (guesses.length + 1 >= GAME_CONFIG.MAX_ATTEMPTS) {
        setGameOver(true);
        setMessageState({
          text: `Игра окончена! Слово: ${targetWord.toUpperCase()}`,
          isVisible: true,
        });
        return;
      }

      setCurrentGuess('');
    } catch (err) {
      console.error('Submission error:', err);
      setMessageState({ text: 'Ошибка соединения', isVisible: true });
      setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 2000);
    }
  }, [currentGuess, guesses.length, targetWord]);

  const resetGame = useCallback(() => {
    setCurrentGuess('');
    setGuesses([]);
    setGameOver(false);
    setGameWon(false);
    setMessageState({ text: '', isVisible: false });
    setLoading(true);
    fetchTargetWord();
  }, [fetchTargetWord]);

  const setMessage = useCallback((text: string) => {
    setMessageState({ text, isVisible: true });
    if (!text.includes('Поздравляем') && !text.includes('Игра окончена')) {
      setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 2500);
    }
  }, []);

  return {
    currentGuess,
    guesses,
    gameOver,
    gameWon,
    targetWord,
    message: message.text,
    showModal: message.isVisible,
    setMessage,
    closeModal: () => setMessageState(prev => ({ ...prev, isVisible: false })),
    handleChar,
    handleDelete,
    handleSubmit,
    resetGame,
    loading,
  };
};

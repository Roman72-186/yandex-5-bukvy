// hooks/useWordle.ts
import { useState, useEffect, useCallback } from 'react';
import { LetterResult, WordResult, CELL_STATUS, GAME_CONFIG } from '../lib/constants';

// Тип для состояния сообщения
interface MessageState {
  text: string;
  isVisible: boolean;
}

export const useWordle = () => {
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<WordResult[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [targetWord, setTargetWord] = useState<string>(''); // Будет получено от API
  const [message, setMessageState] = useState<MessageState>({ text: '', isVisible: false });
  const [loading, setLoading] = useState<boolean>(true); // Для загрузки целевого слова

  // Функция для получения слова дня от API
  const fetchTargetWord = useCallback(async () => {
    try {
      // Пока что используем фиктивный вызов, чтобы получить слово.
      // В реальности, API может не возвращать слово напрямую, а только обрабатывать попытки.
      // Но для инициализации игры, нам нужно знать цель.
      // Вместо этого, мы можем инициализировать игру без знания слова,
      // и API будет возвращать результат для каждой попытки.
      // Тогда `targetWord` будет известен только после победы или в специальном эндпоинте.
      // Пока оставим как есть, предполагая, что API предоставляет эндпоинт для получения слова дня.
      // const response = await fetch('/api/target-word'); // Нужен эндпоинт для получения слова дня
      // const data = await response.json();
      // setTargetWord(data.word);

      // Альтернатива: не получать слово, а доверять результатам от /api/guess
      // и считать, что игра выиграна, когда последний результат - все CORRECT.
      // Это более безопасно с точки зрения читерства.
      // Тогда targetWord можно не хранить на клиенте.
      // Инициализируем пустым и полагаемся на API.

      // Пока инициализируем каким-то словом для тестирования
      // setTargetWord('ТЕСТ');
      // setLoading(false);

      // Реализация без знания targetWord на клиенте:
      setTargetWord(''); // Не храним на клиенте
      setLoading(false);
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setMessageState({ text: 'Ошибка загрузки игры', isVisible: true });
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
      // Отправляем попытку на сервер
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: currentGuess }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Сервер вернул ошибку (например, слово не в словаре)
        setMessageState({ text: data.error || 'Неверное слово', isVisible: true });
        setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 2000);
        return;
      }

      // Сервер вернул успешный результат
      const resultFromServer: WordResult = data.result;

      // Обновляем попытки
      setGuesses(prev => [...prev, resultFromServer]);

      // Проверяем победу
      const isWon = resultFromServer.every(cell => cell.status === CELL_STATUS.CORRECT);
      if (isWon) {
        setGameWon(true);
        setGameOver(true);
        setMessageState({ text: 'Поздравляем! Вы выиграли!', isVisible: true });
        setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 3000);
        return;
      }

      // Проверяем поражение (превышено количество попыток)
      if (guesses.length + 1 >= GAME_CONFIG.MAX_ATTEMPTS) {
        setGameOver(true);
        // В реальной игре, слово раскрывается здесь. Мы можем запросить его отдельно или знать.
        // Пока просто сообщим о поражении.
        setMessageState({ text: `Игра окончена! Загаданное слово: ???`, isVisible: true });
        setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 4000);
        return;
      }

      // Если игра не закончена, очищаем текущее слово
      setCurrentGuess('');

    } catch (err) {
      console.error('Submission error:', err);
      setMessageState({ text: 'Ошибка соединения', isVisible: true });
      setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 2000);
    }
  }, [currentGuess, guesses.length]);

  const resetGame = useCallback(() => {
    setCurrentGuess('');
    setGuesses([]);
    setGameOver(false);
    setGameWon(false);
    setMessageState({ text: '', isVisible: false });
    setLoading(true);
    fetchTargetWord(); // Перезапрашиваем слово дня
  }, [fetchTargetWord]);

  // Функция для установки сообщения (публичный метод)
  const setMessage = useCallback((text: string) => {
    setMessageState({ text, isVisible: true });
    // Автоматически скрываем через 2.5 секунды, если не "Поздравляем"
    if (!text.includes('Поздравляем') && !text.includes('Игра окончена')) {
      setTimeout(() => setMessageState(prev => ({ ...prev, isVisible: false })), 2500);
    }
  }, []);

  return {
    currentGuess,
    guesses,
    gameOver,
    gameWon,
    targetWord, // Может быть пустым, если не храним на клиенте
    message: message.text, // Возвращаем только текст для совместимости с Game.tsx
    showModal: message.isVisible, // Новое состояние для модального окна
    setMessage, // Позволяет устанавливать сообщение извне
    closeModal: () => setMessageState(prev => ({ ...prev, isVisible: false })), // Новый метод для закрытия
    handleChar,
    handleDelete,
    handleSubmit,
    resetGame,
    loading, // Возвращаем состояние загрузки
  };
};
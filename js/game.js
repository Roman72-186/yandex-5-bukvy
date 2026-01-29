import { loadDictionary, getRandomWord } from './words.js';
import { UIController } from './UIController.js';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

class FiveLetterGame {
  constructor() {
    this.ui = new UIController(WORD_LENGTH, MAX_ATTEMPTS);
    this.resetState();
    this.attachEventListeners();
  }

  resetState() {
    this.targetWord = getRandomWord().toUpperCase();
    this.currentRow = 0;
    this.currentCol = 0;
    this.isProcessing = false; // Явный сброс флага обработки
    this.gameOver = false; // Явный сброс флага окончания игры

    if (this.targetWord === '') {
        this.gameOver = true; // Блокируем игру, только если слово не было получено
        console.error("Не удалось получить слово для начала игры. Игра заблокирована.");
        this.ui.showMessage("Ошибка: не удалось загрузить слово. Попробуйте обновить страницу.", false);
    }
    
    console.log('State after reset:', {
      targetWord: this.targetWord,
      gameOver: this.gameOver,
      isProcessing: this.isProcessing,
      currentRow: this.currentRow,
      currentCol: this.currentCol
    });
  }

  async initializeGame() {
    this.ui.createBoard();
    this.ui.createKeyboard();
    this.resetState();
  }

  attachEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyPress(e.key));
    this.ui.keyboardElement.addEventListener('click', (e) => {
      if (e.target.matches('[data-key]')) {
        this.handleKeyPress(e.target.dataset.key);
      }
    });
    document.getElementById('new-game-button').addEventListener('click', () => this.newGame());
  }

  handleKeyPress(key) {
    console.log(`Key pressed: ${key}`, {
      gameOver: this.gameOver,
      isProcessing: this.isProcessing,
      currentRow: this.currentRow,
      currentCol: this.currentCol
    });
    if (this.gameOver || this.isProcessing) {
      console.log("Обработка нажатия прервана из-за gameOver или isProcessing");
      return;
    }

    if (key.toUpperCase() === 'ENTER') {
      this.submitGuess();
    } else if (key.toUpperCase() === 'BACKSPACE' || key.toUpperCase() === 'DELETE') {
      this.deleteLetter();
    } else if (this.currentCol < WORD_LENGTH && /^[а-яё]$/i.test(key)) {
      this.addLetter(key.toUpperCase());
    }
  }

  addLetter(letter) {
    this.ui.updateCell(this.currentRow, this.currentCol, letter);
    this.currentCol++;
  }

  deleteLetter() {
    if (this.currentCol > 0) {
      this.currentCol--;
      this.ui.updateCell(this.currentRow, this.currentCol, '');
    }
  }

  async submitGuess() {
    if (this.currentCol !== WORD_LENGTH) {
      this.ui.shakeRow(this.currentRow);
      return;
    }

    const guess = this.getCurrentGuess();

    this.isProcessing = true;
    const result = this.evaluateGuess(guess);
    this.ui.updateRowStatus(this.currentRow, result);

    if (guess === this.targetWord) {
      this.gameOver = true;
      this.ui.showMessage('Поздравляем! Вы угадали слово!', true);
    } else if (this.currentRow === MAX_ATTEMPTS - 1) {
      this.gameOver = true;
      this.ui.showMessage(`Вы проиграли. Загаданное слово: ${this.targetWord}`, false);
    } else {
      this.currentRow++;
      this.currentCol = 0;
    }
    this.isProcessing = false;
  }
  
  getCurrentGuess() {
      let guess = '';
      for (let i = 0; i < WORD_LENGTH; i++) {
          const cell = document.getElementById(`cell-${this.currentRow}-${i}`);
          guess += cell.textContent;
      }
      return guess.toUpperCase();
  }

  evaluateGuess(guess) {
    const result = [];
    const targetLetters = this.targetWord.split('');
    const guessLetters = guess.split('');
    const usedTargetIndexes = new Array(WORD_LENGTH).fill(false);

    // 1. Проверка на полное совпадение
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = { letter: guessLetters[i], status: 'correct' };
        usedTargetIndexes[i] = true;
      }
    }

    // 2. Проверка на наличие буквы в слове
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i]) continue; // Пропускаем уже найденные

      const letterIndex = targetLetters.findIndex((letter, index) => !usedTargetIndexes[index] && letter === guessLetters[i]);
      
      if (letterIndex !== -1) {
        result[i] = { letter: guessLetters[i], status: 'present' };
        usedTargetIndexes[letterIndex] = true;
      } else {
        result[i] = { letter: guessLetters[i], status: 'absent' };
      }
    }
    return result;
  }

  newGame() {
    console.log('--- Starting New Game ---');
    this.ui.createBoard();
    this.ui.resetKeyboard();
    this.resetState();
  }
}

// Запуск игры после загрузки DOM и словаря
document.addEventListener('DOMContentLoaded', async () => {
  await loadDictionary();
  const game = new FiveLetterGame();
  game.initializeGame();
});

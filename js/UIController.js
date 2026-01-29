export class UIController {
  constructor(wordLength, maxAttempts) {
    this.wordLength = wordLength;
    this.maxAttempts = maxAttempts;
    this.boardElement = document.getElementById('gameBoard');
    this.keyboardElement = document.getElementById('keyboard');
  }

  /**
   * Создает игровое поле.
   */
  createBoard() {
    console.log("createBoard() вызван");
    this.boardElement.innerHTML = '';
    console.log("Старая доска очищена");
    for (let i = 0; i < this.maxAttempts; i++) {
      for (let j = 0; j < this.wordLength; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = `cell-${i}-${j}`;
        cell.setAttribute('aria-label', `Буква ${j + 1}, попытка ${i + 1}`);
        this.boardElement.appendChild(cell);
      }
    }
    console.log("Новая доска создана");
  }

  /**
   * Создает виртуальную клавиатуру.
   */
  createKeyboard() {
    this.keyboardElement.innerHTML = '';
    const keysLayout = [
      ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
      ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
      ['ENTER', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'BACKSPACE']
    ];
    const keyLabels = {
      'ENTER': 'ВВОД',
      'BACKSPACE': '⌫'
    };
    keysLayout.forEach(row => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('key-row');
      row.forEach(key => {
        const keyElement = document.createElement('button');
        keyElement.classList.add('key');
        keyElement.textContent = keyLabels[key] || key;
        keyElement.dataset.key = key;
        keyElement.setAttribute('aria-label', `Клавиша ${key}`);
        if (key === 'ENTER' || key === 'BACKSPACE') {
          keyElement.classList.add('wide');
        }
        rowElement.appendChild(keyElement);
      });
      this.keyboardElement.appendChild(rowElement);
    });
  }

  /**
   * Обновляет ячейку, добавляя букву.
   * @param {number} row
   * @param {number} col
   * @param {string} letter
   */
  updateCell(row, col, letter) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    if (cell) {
      cell.textContent = letter;
    }
  }

  /**
   * Применяет статусы к ячейкам и клавишам после проверки слова.
   * @param {number} row
   * @param {Array<{letter: string, status: string}>} result
   */
  updateRowStatus(row, result) {
    result.forEach((item, col) => {
      const cell = document.getElementById(`cell-${row}-${col}`);
      const key = this.keyboardElement.querySelector(`[data-key="${item.letter.toUpperCase()}"]`);
      if (cell) {
        cell.classList.add(`status-${item.status}`);
      }
      if (key) {
        // Удаляем старые статусы
        key.classList.remove('correct', 'present', 'absent');
        // Добавляем новый статус (приоритет: correct > present > absent)
        const currentStatus = key.dataset.status;
        if (item.status === 'correct' || !currentStatus || currentStatus === 'absent' || (currentStatus === 'present' && item.status === 'correct')) {
          key.classList.add(item.status);
          key.dataset.status = item.status;
        } else if (item.status === 'present' && currentStatus !== 'correct') {
          key.classList.add('present');
          key.dataset.status = 'present';
        } else {
          key.classList.add(currentStatus);
        }
      }
    });
  }

  /**
   * Анимирует тряску текущей строки при неверном вводе.
   * @param {number} row
   */
  shakeRow(row) {
    for (let i = 0; i < this.wordLength; i++) {
        const cell = document.getElementById(`cell-${row}-${i}`);
        if(cell) {
            cell.classList.add('shake');
            cell.addEventListener('animationend', () => cell.classList.remove('shake'), { once: true });
        }
    }
  }

  /**
   * Показывает сообщение пользователю.
   * @param {string} message
   * @param {boolean} isWin
   */
  showMessage(message, isWin) {
    // Эта функция будет заменена на более красивое модальное окно позже
    alert(message);
  }
  /**
   * Сбрасывает классы статусов на виртуальной клавиатуре.
   */
  resetKeyboard() {
    console.log("resetKeyboard() вызван");
    const keys = this.keyboardElement.querySelectorAll('.key');
    console.log(`Найдено клавиш: ${keys.length}`);
    keys.forEach(key => {
      key.classList.remove('correct', 'present', 'absent');
      delete key.dataset.status;
    });
    console.log("Классы статусов клавиатуры сброшены");
  }
}
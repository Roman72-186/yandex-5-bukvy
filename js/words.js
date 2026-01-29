let dictionary = [];
let wordSet = new Set();

/**
 * Загружает словарь из JSON-файла.
 * @returns {Promise<void>}
 */
export async function loadDictionary() {
  try {
    const response = await fetch('js/words.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const words = await response.json();
    dictionary = words;
    wordSet = new Set(words);
    Object.freeze(dictionary); // Защищаем массив от изменений
    console.log('Словарь успешно загружен.');
  } catch (error) {
    console.error('Не удалось загрузить словарь:', error);
  }
}

/**
 * Проверяет, существует ли слово в словаре.
 * @param {string} word Слово для проверки.
 * @returns {boolean}
 */
export function isValidWord(word) {
  return wordSet.has(word.toUpperCase());
}

/**
 * Возвращает случайное слово из словаря.
 * @returns {string}
 */
export function getRandomWord() {
  if (dictionary.length === 0) {
    console.error('Словарь пуст или не загружен.');
    return '';
  }
  const randomIndex = Math.floor(Math.random() * dictionary.length);
  return dictionary[randomIndex];
}
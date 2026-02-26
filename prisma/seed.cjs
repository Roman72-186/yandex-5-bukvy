const { PrismaClient } = require('../lib/generated/prisma');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { readFileSync } = require('fs');
const path = require('path');

const adapter = new PrismaLibSql({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

// Детерминированная перетасовка (Fisher-Yates с seed)
function seededShuffle(array, seed) {
  const arr = [...array];
  let m = arr.length;
  let s = seed;

  while (m) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const i = s % m--;
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }

  return arr;
}

async function main() {
  console.log('Seeding database...');
  const wordsFilePath = path.join(__dirname, 'words.json');

  const wordsFileContent = readFileSync(wordsFilePath, 'utf-8');
  const { words } = JSON.parse(wordsFileContent);

  // Фильтруем только 5-буквенные слова
  const fiveLetterWords = words.filter(w => w.length === 5);
  console.log(`Found ${words.length} words, ${fiveLetterWords.length} are 5-letter words.`);

  // 1. Вставляем слова в WordDictionary
  let wordCount = 0;
  for (const word of fiveLetterWords) {
    await prisma.wordDictionary.upsert({
      where: { word },
      update: {},
      create: { word },
    });
    wordCount++;
    if (wordCount % 100 === 0) console.log(`  ...inserted ${wordCount} words`);
  }
  console.log(`Seeded ${wordCount} words into dictionary.`);

  // 2. Получаем все слова с ID
  const allWords = await prisma.wordDictionary.findMany({
    select: { id: true, word: true },
  });
  console.log(`Total words in DB: ${allWords.length}`);

  // 3. Перетасовываем детерминированно
  const shuffled = seededShuffle(allWords, 42);

  // 4. Назначаем по одному слову на каждый день, начиная с 2025-01-01
  const baseDate = new Date('2025-01-01T00:00:00.000Z');
  let created = 0;

  for (let i = 0; i < shuffled.length; i++) {
    const date = new Date(baseDate.getTime() + i * 86400000); // +1 day in ms
    const wordEntry = shuffled[i];

    try {
      await prisma.dailyWord.upsert({
        where: { date: date },
        update: {},
        create: {
          date: date,
          wordId: wordEntry.id,
        },
      });
      created++;
    } catch (e) {
      // Пропускаем конфликты (wordId уже используется)
    }
    if (created % 100 === 0 && created > 0 && i === created - 1) {
      console.log(`  ...assigned ${created} daily words`);
    }
  }

  console.log(`Daily words assigned: ${created}`);

  // Проверяем сегодняшнее слово
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDate = new Date(todayStr + 'T00:00:00.000Z');

  const todayWord = await prisma.dailyWord.findUnique({
    where: { date: todayDate },
    include: { word: true },
  });

  if (todayWord) {
    console.log(`Today's word (${todayStr}): ${todayWord.word.word}`);
  } else {
    console.log(`No word for today (${todayStr})`);
  }

  await prisma.$disconnect();
  console.log('Database seeding completed.');
}

main().catch(async (e) => {
  console.error('Seed error:', e);
  await prisma.$disconnect();
  process.exit(1);
});

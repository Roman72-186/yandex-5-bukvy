import { PrismaClient } from '../lib/generated/prisma';
import { readFileSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface WordsJSON {
  words: string[];
}

async function main() {
  console.log('Seeding database...');
  const wordsFilePath = path.join(__dirname, 'words.json');

  try {
    const wordsFileContent = readFileSync(wordsFilePath, 'utf-8');
    const { words }: WordsJSON = JSON.parse(wordsFileContent);

    console.log(`Found ${words.length} words in ${wordsFilePath}. Inserting into database...`);

    // Insert words into WordDictionary table
    for (const word of words) {
      await prisma.wordDictionary.upsert({
        where: { word }, // Find by word, if exists
        update: {}, // If exists, do nothing for the word itself
        create: { word }, // If doesn't exist, create it
      });
    }

    console.log(`Successfully seeded ${words.length} unique words.`);

    // Now, we can potentially assign a daily word for today or a fixed date if needed.
    // For demo purposes, let's assign the first word to today's date if no daily word exists yet.
    // In a real scenario, you'd have a mechanism to select the "word of the day".
    // const today = new Date();
    // const year = today.getFullYear();
    // const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    // const day = String(today.getDate()).padStart(2, '0');
    // const todayString = `${year}-${month}-${day}`;
    // const todayDate = new Date(todayString);
    //
    // const count = await prisma.dailyWord.count({
    //   where: { date: todayDate },
    // });
    //
    // if (count === 0 && words.length > 0) {
    //   // Get the wordDictionary entry for the first word
    //   const firstWordEntry = await prisma.wordDictionary.findUniqueOrThrow({
    //     where: { word: words[0] },
    //   });
    //
    //   await prisma.dailyWord.create({
    //     data: {
    //       date: todayDate,
    //       wordId: firstWordEntry.id,
    //     },
    //   });
    //   console.log(`Assigned word "${words[0]}" (ID: ${firstWordEntry.id}) as the daily word for ${todayString}.`);
    // } else {
    //   console.log(`Skipped assigning daily word for ${todayString} (already exists or no words).`);
    // }

    console.log('Database seeding completed.');
  } catch (e) {
    console.error('Error during seeding:', e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
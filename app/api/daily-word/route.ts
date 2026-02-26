import { NextResponse } from 'next/server';
import { getDailyWordForDate } from '../../../services/gameService';

export async function GET() {
  try {
    const today = new Date();
    const dailyWord = await getDailyWordForDate(today);

    if (!dailyWord) {
      return NextResponse.json(
        { error: 'Слово дня не найдено' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      word: dailyWord.word,
      date: today.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching daily word:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDailyWord } from '../../../lib/words';

export async function GET() {
  try {
    const today = new Date();
    const word = getDailyWord(today);

    return NextResponse.json({
      word,
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

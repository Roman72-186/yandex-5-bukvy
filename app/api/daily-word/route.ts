import { NextRequest, NextResponse } from 'next/server';
import { getDailyWord, getRandomWord } from '../../../lib/words';

export async function GET(request: NextRequest) {
  try {
    const random = request.nextUrl.searchParams.get('random');
    const word = random ? getRandomWord() : getDailyWord(new Date());

    return NextResponse.json({ word });
  } catch (error) {
    console.error('Error fetching word:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Vercel Serverless Function для обработки результатов игры

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gameData = req.body;

    // Валидация данных
    if (!gameData.result || !gameData.word || !gameData.attempts || !gameData.telegram_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Game result received:', gameData);

    // URL вебхука (задается через переменные окружения)
    const webhookUrl = process.env.WEBHOOK_URL;

    if (webhookUrl) {
      // Отправляем данные на WatBot вебхук
      const watbotPayload = {
        telegram_id: gameData.telegram_id,
        result: gameData.result,
        word: gameData.word,
        attempts: gameData.attempts,
        duration: gameData.duration,
        timestamp: gameData.timestamp
      };

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(watbotPayload)
      });

      if (!webhookResponse.ok) {
        console.error('Webhook delivery failed:', webhookResponse.statusText);
      }
    }

    // Возвращаем успешный ответ клиенту
    res.status(200).json({
      success: true,
      message: 'Game result recorded'
    });

  } catch (error) {
    console.error('Error processing game result:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

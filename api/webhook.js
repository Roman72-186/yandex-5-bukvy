// Vercel Serverless Function для обработки результатов игры

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gameData = req.body;

    // Валидация данных
    if (!gameData.result || !gameData.word || !gameData.attempts) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Game result received:', gameData);

    // URL вебхука (задается через переменные окружения)
    const webhookUrl = process.env.WEBHOOK_URL;

    if (webhookUrl) {
      // Отправляем данные на внешний вебхук
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formatGameResult(gameData),
          data: gameData
        })
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

// Форматирование результата игры для отправки в вебхук
function formatGameResult(data) {
  const resultEmoji = data.result === 'win' ? '✅' : '❌';
  const resultText = data.result === 'win' ? 'Победа' : 'Поражение';

  return `
🎮 **Результат игры "5 букв"**

${resultEmoji} **${resultText}**
📝 Слово: **${data.word}**
🎯 Попыток: **${data.attempts}/6**
⏱️ Время: **${data.duration} сек**
🕐 Дата: ${new Date(data.timestamp).toLocaleString('ru-RU')}
  `.trim();
}

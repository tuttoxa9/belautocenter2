import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log("ЗАПУСК: /api/test-meta-lead");

  try {
    // Формируем фейковые данные тестового лида
    const testLeadData = {
      name: 'Тестовый Лид',
      phone: '+1234567890',
      email: 'test@example.com',
    }

    // Отправляем в Telegram
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID

    console.log("TELEGRAM_BOT_TOKEN доступен:", !!TELEGRAM_BOT_TOKEN);
    console.log("TELEGRAM_CHANNEL_ID:", TELEGRAM_CHANNEL_ID);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
      console.error("ОШИБКА: Telegram credentials не настроены");
      return NextResponse.json(
        { success: false, error: 'Telegram credentials not configured' },
        { status: 500 }
      )
    }

    const message = `📱 <b>ТЕСТОВЫЙ лид из Meta (Facebook/Instagram)</b>\n\n👤 <b>Имя:</b> ${testLeadData.name}\n📞 <b>Телефон:</b> ${testLeadData.phone}\n📧 <b>Email:</b> ${testLeadData.email}\n\n⚠️ <i>Это тестовое сообщение</i>`

    console.log("Сформированное сообщение для Telegram:", message);

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    try {
      console.log("Отправка запроса в Telegram API...");
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      })

      console.log("Ответ Telegram API - статус:", response.status);
      const responseText = await response.text();
      console.log("Ответ Telegram API - тело:", responseText);

      if (response.ok) {
        console.log("УСПЕХ: Тестовое сообщение отправлено в Telegram");
        return NextResponse.json({
          success: true,
          message: 'Тестовое сообщение отправлено в Telegram'
        })
      } else {
        console.error("ОШИБКА: Не удалось отправить тестовое сообщение в Telegram");
        return NextResponse.json(
          { success: false, error: 'Failed to send test message to Telegram' },
          { status: 500 }
        )
      }
    } catch (telegramError) {
      console.error("ОШИБКА при отправке в Telegram:", telegramError);
      throw telegramError;
    }
  } catch (error) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА в /api/test-meta-lead:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

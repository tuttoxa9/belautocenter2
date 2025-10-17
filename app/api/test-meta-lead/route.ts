import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
      return NextResponse.json(
        { success: false, error: 'Telegram credentials not configured' },
        { status: 500 }
      )
    }

    const message = `📱 <b>ТЕСТОВЫЙ лид из Meta (Facebook/Instagram)</b>\n\n👤 <b>Имя:</b> ${testLeadData.name}\n📞 <b>Телефон:</b> ${testLeadData.phone}\n📧 <b>Email:</b> ${testLeadData.email}\n\n⚠️ <i>Это тестовое сообщение</i>`

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

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

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Тестовое сообщение отправлено в Telegram'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send test message to Telegram' },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      email,
      type,
      message: userMessage,
      carPrice,
      downPayment,
      loanTerm,
      bank,
      carMake,
      carModel,
      carYear,
      carId,
      bookingDate,
      bookingTime
    } = body

    // Получаем переменные окружения для Telegram
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('Telegram credentials not configured')
      return NextResponse.json({ success: true, message: 'Заявка сохранена' })
    }

    // Формируем сообщение в зависимости от типа заявки
    let message = ''

    switch (type) {
      case 'callback':
        message = `🔔 <b>Новая заявка на обратный звонок</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`
        if (carMake && carModel) {
          message += `\n🚗 <b>Автомобиль:</b> ${carMake} ${carModel}`
          if (carYear) {
            message += ` ${carYear}`
          }
        }
        if (carId) {
          message += `\n🔗 <b>Ссылка:</b> https://belautocenter.by/catalog/${carId}`
        }
        break

      case 'car_selection':
        message = `🚗 <b>Новая заявка на подбор автомобиля</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`
        break

      case 'credit_request':
        message = `💳 <b>Новая заявка на кредит</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`
        if (carMake && carModel) {
          message += `\n🚗 <b>Автомобиль:</b> ${carMake} ${carModel}`
          if (carYear) {
            message += ` ${carYear}`
          }
        }
        if (carId) {
          message += `\n🔗 <b>Ссылка:</b> https://belautocenter.by/catalog/${carId}`
        }
        message += `\n💰 <b>Стоимость авто:</b> ${carPrice}\n💵 <b>Первый взнос:</b> ${downPayment}\n📅 <b>Срок кредита:</b> ${loanTerm} мес.\n🏦 <b>Банк:</b> ${bank}`
        if (userMessage) {
          message += `\n📝 <b>Сообщение:</b> ${userMessage}`
        }
        break

      case 'leasing_request':
        message = `🚙 <b>Новая заявка на лизинг</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`
        if (email) {
          message += `\n📧 <b>Email:</b> ${email}`
        }
        if (carMake && carModel) {
          message += `\n🚗 <b>Автомобиль:</b> ${carMake} ${carModel}`
          if (carYear) {
            message += ` ${carYear}`
          }
        }
        if (carId) {
          message += `\n🔗 <b>Ссылка:</b> https://belautocenter.by/catalog/${carId}`
        }
        if (carPrice) {
          message += `\n💰 <b>Стоимость авто:</b> ${carPrice}`
        }
        if (downPayment) {
          message += `\n💵 <b>Первый взнос:</b> ${downPayment}`
        }
        if (loanTerm) {
          message += `\n📅 <b>Срок лизинга:</b> ${loanTerm} мес.`
        }
        if (userMessage) {
          message += `\n📝 <b>Сообщение:</b> ${userMessage}`
        }
        break

      case 'contact_form':
        message = `📬 <b>Новое сообщение с сайта</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}\n📧 <b>Email:</b> ${email}\n📝 <b>Сообщение:</b> ${userMessage}`
        break

      case 'car_booking':
        message = `📅 <b>Новая заявка на просмотр автомобиля</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`
        if (carMake && carModel) {
          message += `\n🚗 <b>Автомобиль:</b> ${carMake} ${carModel}`
          if (carYear) {
            message += ` ${carYear}`
          }
        }
        if (carId) {
          message += `\n🔗 <b>Ссылка:</b> https://belautocenter.by/catalog/${carId}`
        }
        if (bookingDate) {
          message += `\n📅 <b>Дата:</b> ${bookingDate}`
        }
        if (bookingTime) {
          message += `\n🕐 <b>Время:</b> ${bookingTime}`
        }
        if (userMessage) {
          message += `\n📝 <b>Комментарий:</b> ${userMessage}`
        }
        break

      default:
        message = `📝 <b>Новая заявка</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`
        if (email) {
          message += `\n📧 <b>Email:</b> ${email}`
        }
        if (userMessage) {
          message += `\n📝 <b>Сообщение:</b> ${userMessage}`
        }
    }

    // Отправляем в Telegram с таймаутом
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 секунд таймаут

    try {
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return NextResponse.json({ success: true, message: 'Уведомление отправлено в Telegram' })
      } else {
        console.error('Failed to send Telegram message:', await response.text())
        return NextResponse.json({ success: true, message: 'Заявка сохранена' })
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Telegram request timeout or error:', fetchError)
      return NextResponse.json({ success: true, message: 'Заявка сохранена' })
    }

  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return NextResponse.json({ success: true, message: 'Заявка сохранена' })
  }
}

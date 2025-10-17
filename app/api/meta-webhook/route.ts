import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 })
    } else {
      return new NextResponse('Forbidden', { status: 403 })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Verification error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log("ЗАПУСК: /api/meta-webhook POST");

  try {
    const body = await request.json()
    console.log("Полученное тело запроса от Meta:", JSON.stringify(body, null, 2));

    // Извлекаем leadgen_id из тела запроса
    const leadgenId = body?.entry?.[0]?.changes?.[0]?.value?.leadgen_id
    console.log("Извлеченный leadgen_id:", leadgenId);

    if (!leadgenId) {
      console.error("ОШИБКА: leadgen_id не найден в теле запроса");
      return NextResponse.json(
        { success: false, error: 'No lead ID found' },
        { status: 400 }
      )
    }

    const META_PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    console.log("META_PAGE_ACCESS_TOKEN доступен:", !!META_PAGE_ACCESS_TOKEN);
    console.log("TELEGRAM_BOT_TOKEN доступен:", !!TELEGRAM_BOT_TOKEN);
    console.log("TELEGRAM_CHAT_ID:", TELEGRAM_CHAT_ID);

    if (!META_PAGE_ACCESS_TOKEN) {
      console.error("ОШИБКА: META_PAGE_ACCESS_TOKEN не настроен");
      return NextResponse.json(
        { success: false, error: 'Meta access token not configured' },
        { status: 500 }
      )
    }

    // Получаем полную информацию о лиде от Meta Graph API
    try {
      console.log("Запрос данных лида из Meta Graph API...");
      const leadResponse = await fetch(
        `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${META_PAGE_ACCESS_TOKEN}`
      )

      console.log("Ответ Meta Graph API - статус:", leadResponse.status);

      if (!leadResponse.ok) {
        const errorText = await leadResponse.text();
        console.error("ОШИБКА Meta Graph API - тело:", errorText);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch lead data from Meta' },
          { status: 500 }
        )
      }

      const leadData = await leadResponse.json()
      console.log("Полученные данные лида от Meta:", JSON.stringify(leadData, null, 2));

    // Парсим данные лида в нужный формат
    const leadFields: Record<string, string> = {}
    if (leadData.field_data) {
      leadData.field_data.forEach((field: any) => {
        leadFields[field.name] = field.values?.[0] || ''
      })
    }

    const leadInfo = {
      leadId: leadgenId,
      name: leadFields.full_name || leadFields.name || '',
      phone: leadFields.phone_number || leadFields.phone || '',
      email: leadFields.email || '',
      createdAt: new Date().toISOString(),
      rawData: leadData,
    }

    // Сохраняем в Firestore через REST API
    const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/metaLeads`

    try {
      // Конвертируем данные в формат Firestore
      const firestoreData = {
        fields: {
          leadId: { stringValue: leadInfo.leadId },
          name: { stringValue: leadInfo.name },
          phone: { stringValue: leadInfo.phone },
          email: { stringValue: leadInfo.email },
          createdAt: { stringValue: leadInfo.createdAt },
          rawData: {
            mapValue: {
              fields: {
                fieldData: { stringValue: JSON.stringify(leadData.field_data || []) }
              }
            }
          },
        }
      }

      await fetch(firestoreUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(firestoreData),
      })
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError)
    }

    // Отправляем в Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `📱 <b>Новый лид из Meta (Facebook/Instagram)</b>\n\n👤 <b>Имя:</b> ${leadInfo.name}\n📞 <b>Телефон:</b> ${leadInfo.phone}\n📧 <b>Email:</b> ${leadInfo.email}`

      console.log("Сформированное сообщение для Telegram:", message);

      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

      try {
        console.log("Отправка уведомления в Telegram...");
        const telegramResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
          }),
        })

        console.log("Ответ Telegram API - статус:", telegramResponse.status);
        const telegramResponseText = await telegramResponse.text();
        console.log("Ответ Telegram API - тело:", telegramResponseText);

        if (telegramResponse.ok) {
          console.log("УСПЕХ: Уведомление отправлено в Telegram");
        } else {
          console.error("ОШИБКА: Не удалось отправить уведомление в Telegram");
        }
      } catch (telegramError) {
        console.error("ОШИБКА при отправке в Telegram:", telegramError);
      }
    } else {
      console.log("ВНИМАНИЕ: Telegram credentials отсутствуют, уведомление не отправлено");
    }

    console.log("УСПЕХ: Лид обработан успешно");
    return NextResponse.json({ success: true }, { status: 200 })
    } catch (metaError) {
      console.error("ОШИБКА при запросе к Meta Graph API:", metaError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch lead from Meta' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА в /api/meta-webhook POST:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

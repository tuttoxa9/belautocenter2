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
  try {
    const body = await request.json()

    // Извлекаем leadgen_id из тела запроса
    const leadgenId = body?.entry?.[0]?.changes?.[0]?.value?.leadgen_id

    if (!leadgenId) {
      return NextResponse.json(
        { success: false, error: 'No lead ID found' },
        { status: 400 }
      )
    }

    const META_PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN

    if (!META_PAGE_ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Meta access token not configured' },
        { status: 500 }
      )
    }

    // Получаем полную информацию о лиде от Meta Graph API
    const leadResponse = await fetch(
      `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${META_PAGE_ACCESS_TOKEN}`
    )

    if (!leadResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch lead data from Meta' },
        { status: 500 }
      )
    }

    const leadData = await leadResponse.json()

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
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHANNEL_ID) {
      const message = `📱 <b>Новый лид из Meta (Facebook/Instagram)</b>\n\n👤 <b>Имя:</b> ${leadInfo.name}\n📞 <b>Телефон:</b> ${leadInfo.phone}\n📧 <b>Email:</b> ${leadInfo.email}`

      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

      await fetch(telegramUrl, {
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
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

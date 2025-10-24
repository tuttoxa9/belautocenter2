import { NextResponse } from "next/server";
import * as z from "zod";
import { firestoreApi } from "@/lib/firestore-api";

const buybackFormSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\+375\d{9}$/),
  car: z.string().min(2),
  city: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, car, city } = buybackFormSchema.parse(body);

    // Отправляем уведомление в Telegram
    await fetch(`${req.nextUrl.origin}/api/send-telegram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "buyback_request",
        name,
        phone,
        car,
        city,
      }),
    });

    // Сохраняем заявку в Firestore
    await firestoreApi.addDocument("buybackRequests", {
      name,
      phone,
      car,
      city,
      createdAt: new Date(),
      status: "new",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

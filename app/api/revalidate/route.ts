import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

// Route handler for POST requests to trigger revalidation
export async function POST(request: NextRequest) {
  // 1. Check for the secret token
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATION_TOKEN) {
    return new NextResponse(JSON.stringify({ message: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 2. Get the tag to revalidate from the request body
  const body = await request.json()
  const tag = body.tag

  if (!tag) {
    return new NextResponse(JSON.stringify({ message: 'Tag is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 3. Revalidate the tag
  revalidateTag(tag)

  // 4. Return a success response
  return NextResponse.json({ revalidated: true, tag: tag, now: Date.now() })
}
import { NextRequest, NextResponse } from 'next/server'

const PHONE_PATTERN = /^[+\d][\d\s().-]{7,19}$/

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { name?: unknown; phone?: unknown; language?: unknown }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const language = typeof body.language === 'string' ? body.language : 'en'

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Please enter a valid name.' }, { status: 400 })
  }

  if (!PHONE_PATTERN.test(phone)) {
    return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
  }

  console.log('[lead]', {
    name,
    phone,
    language,
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}

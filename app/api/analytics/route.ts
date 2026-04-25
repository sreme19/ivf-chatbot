import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsEvent, AnalyticsEventName } from '@/types'

const VALID_EVENTS: AnalyticsEventName[] = [
  'chat_started',
  'question_asked',
  'emergency_escalation',
  'call_clicked',
  'whatsapp_clicked',
  'booking_clicked',
]

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Partial<AnalyticsEvent>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { event, timestamp, sessionId } = body

  // Validate event name
  if (!event || !VALID_EVENTS.includes(event as AnalyticsEventName)) {
    return NextResponse.json(
      { error: `Invalid event name. Must be one of: ${VALID_EVENTS.join(', ')}` },
      { status: 400 }
    )
  }

  // Log event server-side (MVP: console only)
  // TODO: Replace with real analytics provider (PostHog, Mixpanel, GA4) post-MVP
  console.log('[analytics]', {
    event,
    timestamp: timestamp || new Date().toISOString(),
    sessionId: sessionId || 'unknown',
    metadata: body.metadata,
  })

  return NextResponse.json({ success: true }, { status: 200 })
}

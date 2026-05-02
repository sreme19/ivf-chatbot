import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsEvent, AnalyticsEventName } from '@/types'

const VALID_EVENTS: AnalyticsEventName[] = [
  'chat_started',
  'question_asked',
  'emergency_escalation',
  'call_clicked',
  'whatsapp_clicked',
  'booking_clicked',
  'location_clicked',
  'instagram_clicked',
  'feedback_submitted',
  'suggestion_clicked',
  'language_selected',
  'voice_input_started',
  'voice_input_completed',
  'lead_submitted',
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

  const analyticsEvent: AnalyticsEvent = {
    event,
    timestamp: timestamp || new Date().toISOString(),
    sessionId: sessionId || 'unknown',
    metadata: body.metadata,
  }

  console.log('[analytics]', analyticsEvent)

  dispatchAnalytics(analyticsEvent).catch(error => {
    console.error('[analytics] provider dispatch failed:', error)
  })

  return NextResponse.json({ success: true }, { status: 200 })
}

async function dispatchAnalytics(event: AnalyticsEvent): Promise<void> {
  if (process.env.POSTHOG_API_KEY) {
    await fetch(process.env.POSTHOG_HOST || 'https://app.posthog.com/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.POSTHOG_API_KEY,
        event: event.event,
        distinct_id: event.sessionId,
        properties: {
          timestamp: event.timestamp,
          ...event.metadata,
        },
      }),
    })
  }

  if (process.env.MIXPANEL_TOKEN) {
    await fetch('https://api.mixpanel.com/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        event: event.event,
        properties: {
          token: process.env.MIXPANEL_TOKEN,
          distinct_id: event.sessionId,
          time: Math.floor(new Date(event.timestamp).getTime() / 1000),
          ...event.metadata,
        },
      }]),
    })
  }

  if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
    const url = new URL('https://www.google-analytics.com/mp/collect')
    url.searchParams.set('measurement_id', process.env.GA4_MEASUREMENT_ID)
    url.searchParams.set('api_secret', process.env.GA4_API_SECRET)

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: event.sessionId,
        events: [{
          name: event.event,
          params: {
            timestamp: event.timestamp,
            ...event.metadata,
          },
        }],
      }),
    })
  }

  if (!process.env.POSTHOG_API_KEY && !process.env.MIXPANEL_TOKEN && !process.env.GA4_MEASUREMENT_ID) {
    console.log('[analytics] no external provider configured', {
      event,
    })
  }
}

import { AnalyticsEventName, AnalyticsEvent } from '@/types'

const SESSION_ID_KEY = 'ivf_session_id'

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

export function emitEvent(
  event: AnalyticsEventName,
  metadata?: Record<string, string>
): void {
  try {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      metadata,
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[analytics]', analyticsEvent)
    }

    // POST to analytics endpoint (fire and forget)
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsEvent),
      }).catch(() => {
        // Swallow errors silently — analytics must not interrupt chat
      })
    }
  } catch {
    // Swallow all analytics errors silently
  }
}

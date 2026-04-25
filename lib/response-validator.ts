export const MAX_RESPONSE_LENGTH = 1500

export const SAFE_FALLBACK_RESPONSE =
  "I want to make sure I give you accurate and safe information. For this particular question, I'd recommend speaking directly with Dr. Mekhala's team, who can give you personalised guidance. Please don't hesitate to call, WhatsApp, or book a consultation — they're here to help."

export const FORBIDDEN_PATTERNS: RegExp[] = [
  /take\s+\d+\s*mg/i,
  /take\s+\d+\s*iu/i,
  /your\s+amh\s+(is|means|indicates|shows|suggests)/i,
  /your\s+beta.?hcg/i,
  /you\s+(have|are\s+diagnosed\s+with|likely\s+have)/i,
  /you\s+(should|must)\s+(take|stop|increase|decrease|start|continue)/i,
  /prescribe|prescription/i,
  /dosage\s+of\s+\d+/i,
]

function truncateAtSentenceBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  // Find the last sentence boundary (., !, ?)
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? '),
    truncated.lastIndexOf('.\n'),
  )

  if (lastSentenceEnd > maxLength * 0.5) {
    return truncated.substring(0, lastSentenceEnd + 1).trim()
  }

  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 0 ? truncated.substring(0, lastSpace).trim() + '...' : truncated.trim()
}

export function validateResponse(rawResponse: string): string {
  if (!rawResponse || rawResponse.trim().length === 0) {
    return SAFE_FALLBACK_RESPONSE
  }

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(rawResponse)) {
      console.warn('[response-validator] Forbidden pattern detected:', pattern.toString())
      return SAFE_FALLBACK_RESPONSE
    }
  }

  // Truncate if too long
  if (rawResponse.length > MAX_RESPONSE_LENGTH) {
    return truncateAtSentenceBoundary(rawResponse, MAX_RESPONSE_LENGTH)
  }

  return rawResponse
}

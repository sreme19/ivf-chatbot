import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ChatRequest, ChatResponse, Language } from '@/types'
import { detectEmergency } from '@/lib/emergency-detector'
import { retrieveContext } from '@/lib/retrieval'
import { buildSystemPrompt } from '@/lib/prompt-builder'
import { validateResponse } from '@/lib/response-validator'
import { isLanguage, DEFAULT_LANGUAGE } from '@/lib/i18n'

const EMERGENCY_GUIDANCE: Record<Language, string> = {
  en: 'Please contact the clinic immediately or seek emergency care. Do not wait — your health and safety come first. Call the clinic directly or go to your nearest emergency department.',
  hi: 'कृपया तुरंत क्लिनिक से संपर्क करें या आपातकालीन देखभाल लें। प्रतीक्षा न करें — आपकी सेहत और सुरक्षा सबसे पहले है। क्लिनिक को सीधे कॉल करें या निकटतम आपातकालीन विभाग जाएँ।',
  kn: 'ದಯವಿಟ್ಟು ಕ್ಲಿನಿಕ್ ಅನ್ನು ತಕ್ಷಣ ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ತುರ್ತು ಆರೈಕೆ ಪಡೆಯಿರಿ. ಕಾಯಬೇಡಿ — ನಿಮ್ಮ ಆರೋಗ್ಯ ಮತ್ತು ಸುರಕ್ಷತೆ ಮೊದಲು. ಕ್ಲಿನಿಕ್‌ಗೆ ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ತುರ್ತು ವಿಭಾಗಕ್ಕೆ ಹೋಗಿ.',
}

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 12
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse | { error: string }>> {
  let body: ChatRequest

  const rateLimitResult = checkRateLimit(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many messages in a short time. Please wait a moment before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
        },
      }
    )
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { userMessage, messages } = body
  const language: Language = isLanguage(body.language) ? body.language : DEFAULT_LANGUAGE

  // Validate userMessage
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
    return NextResponse.json({ error: 'userMessage is required and must be a non-empty string' }, { status: 400 })
  }

  if (userMessage.length > 1000) {
    return NextResponse.json({ error: 'Message too long. Please keep your message under 1000 characters.' }, { status: 400 })
  }

  // Validate messages array
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: 'messages must be an array' }, { status: 400 })
  }

  if (messages.length > 20) {
    return NextResponse.json({ error: 'Conversation history too long' }, { status: 400 })
  }

  // Step 1: Emergency detection (BEFORE model call)
  const emergencyResult = detectEmergency(userMessage)

  if (emergencyResult.isEmergency) {
    // Emit analytics (fire and forget)
    emitAnalytics('emergency_escalation').catch(() => {})

    return NextResponse.json({
      response: '',
      isEmergency: true,
      emergencyMessage: EMERGENCY_GUIDANCE[language],
    })
  }

  // Step 2: Retrieve relevant knowledge base context
  const chunks = retrieveContext(userMessage)

  // Step 3: Build system prompt
  const systemPrompt = buildSystemPrompt(chunks, language)

  // Step 4: Call Claude API
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    const model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'

    if (!apiKey) {
      console.error('[api/chat] ANTHROPIC_API_KEY is not set')
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please contact the clinic directly.' },
        { status: 503 }
      )
    }

    const client = new Anthropic({ apiKey })

    // Build conversation messages (cap at 20)
    const conversationMessages = messages.slice(-20).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    conversationMessages.push({ role: 'user', content: userMessage })

    const claudeResponse = await client.messages.create({
      model,
      system: systemPrompt,
      messages: conversationMessages,
      max_tokens: 1024,
    })

    // Extract text content
    const rawResponse = claudeResponse.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('')

    // Step 5: Validate response
    const validatedResponse = validateResponse(rawResponse)

    // Emit analytics (fire and forget)
    emitAnalytics('question_asked').catch(() => {})

    return NextResponse.json({
      response: validatedResponse,
      isEmergency: false,
      retrievedChunks: chunks.length,
    })
  } catch (error) {
    console.error('[api/chat] Claude API error:', error)
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please contact the clinic directly.' },
      { status: 503 }
    )
  }
}

function checkRateLimit(request: NextRequest): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwardedFor || request.headers.get('x-real-ip') || 'local'
  const now = Date.now()
  const bucket = rateLimitBuckets.get(ip)

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now }
  }

  bucket.count += 1
  return { allowed: true }
}

async function emitAnalytics(event: string): Promise<void> {
  try {
    // In production this would POST to /api/analytics
    // For now, log server-side
    console.log('[analytics]', { event, timestamp: new Date().toISOString() })
  } catch {
    // Swallow analytics errors silently
  }
}

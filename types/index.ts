// Language types
export type Language = 'en' | 'hi' | 'kn'

// Message types
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isEmergency?: boolean
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

// API types
export interface ChatRequest {
  messages: ConversationMessage[]
  userMessage: string
  language?: Language
}

export interface ChatResponse {
  response: string
  isEmergency: boolean
  emergencyMessage?: string
  retrievedChunks?: number
}

// Knowledge base types
export interface FAQChunk {
  id: string
  topic: string
  heading: string
  content: string
  keywords: string[]
}

// Analytics types
export type AnalyticsEventName =
  | 'chat_started'
  | 'question_asked'
  | 'emergency_escalation'
  | 'call_clicked'
  | 'whatsapp_clicked'
  | 'booking_clicked'

export interface AnalyticsEvent {
  event: AnalyticsEventName
  timestamp: string  // ISO 8601
  sessionId: string
  metadata?: Record<string, string>
}

// Emergency detection types
export interface EmergencyResult {
  isEmergency: boolean
  matchedKeywords: string[]
}

// Component prop types
export interface ChatInterfaceProps {
  clinicPhone: string
  clinicWhatsApp: string
  bookingUrl: string
}

export interface ClinicCTABarProps {
  clinicPhone: string
  clinicWhatsApp: string
  bookingUrl: string
  onCallClick: () => void
  onWhatsAppClick: () => void
  onBookingClick: () => void
}

export interface EmergencyBannerProps {
  clinicPhone: string
  clinicWhatsApp: string
  language?: Language
}

export interface MessageBubbleProps {
  message: Message
  isLatest: boolean
}

export interface ChatInputProps {
  onSubmit: (message: string) => void
  isLoading: boolean
  disabled: boolean
  language: Language
}

// Language types
export type Language = 'en' | 'hi' | 'kn'

// Message types
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isEmergency?: boolean
  feedback?: 'helpful' | 'not_helpful'
  videos?: Video[]
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

export interface Video {
  id: string
  title: string
  youtubeUrl: string
  duration: string
  channel: string
  description: string
}

export interface ChatResponse {
  response: string
  isEmergency: boolean
  emergencyMessage?: string
  retrievedChunks?: number
  relatedVideos?: Video[]
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
  | 'location_clicked'
  | 'instagram_clicked'
  | 'feedback_submitted'
  | 'suggestion_clicked'
  | 'language_selected'
  | 'voice_input_started'
  | 'voice_input_completed'
  | 'lead_submitted'

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
  bookingUrl: string
  clinicLocationUrl: string
  instagramUrl: string
}

export interface ClinicCTABarProps {
  clinicPhone: string
  bookingUrl: string
  clinicLocationUrl: string
  instagramUrl: string
  onCallClick: () => void
  onBookingClick: () => void
  onLocationClick: () => void
  onInstagramClick: () => void
}

export interface EmergencyBannerProps {
  clinicPhone: string
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

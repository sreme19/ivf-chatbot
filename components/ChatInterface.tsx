'use client'

import { FormEvent, useState, useRef, useEffect } from 'react'
import { Message, ChatInterfaceProps, ChatResponse, Language } from '@/types'
import MessageBubble from '@/components/MessageBubble'
import TypingIndicator from '@/components/TypingIndicator'
import EmergencyBanner from '@/components/EmergencyBanner'
import ClinicCTABar from '@/components/ClinicCTABar'
import ChatInput from '@/components/ChatInput'
import { emitEvent } from '@/lib/analytics'
import { SUPPORTED_LANGUAGES, UI_STRINGS, DEFAULT_LANGUAGE } from '@/lib/i18n'
import { isSpeechSynthesisSupported, speak, stopSpeaking } from '@/lib/voice'

const CHAT_STORAGE_KEY = 'ivf_chat_messages'
const LANGUAGE_STORAGE_KEY = 'ivf_language'

const STARTER_QUESTIONS = [
  'What is IVF?',
  'What does a typical IVF timeline look like?',
  'How many IVF cycles are usually needed?',
  'What questions should I ask my doctor?',
]

const FOLLOW_UP_QUESTIONS = [
  'What should I expect at the first consultation?',
  'How can I prepare emotionally for IVF?',
  'What symptoms need urgent clinic attention?',
]

function reviveMessages(raw: string | null): Message[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed.map(message => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }))
  } catch {
    return null
  }
}

function isStoredLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'hi' || value === 'kn'
}

export default function ChatInterface({
  clinicPhone,
  clinicWhatsApp,
  bookingUrl,
  clinicLocationUrl,
  instagramUrl,
}: ChatInterfaceProps) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [voiceOutEnabled, setVoiceOutEnabled] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(false)
  const [showCallbackDrawer, setShowCallbackDrawer] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: UI_STRINGS[DEFAULT_LANGUAGE].welcome,
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUserAskedQuestion, setHasUserAskedQuestion] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadStatus, setLeadStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const t = UI_STRINGS[language]

  useEffect(() => {
    setTtsSupported(isSpeechSynthesisSupported())
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const sync = () => setTtsSupported(true)
      window.speechSynthesis.onvoiceschanged = sync
    }
    return () => {
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    const savedMessages = reviveMessages(sessionStorage.getItem(CHAT_STORAGE_KEY))
    if (savedMessages) {
      setMessages(savedMessages)
      setHasUserAskedQuestion(savedMessages.some(message => message.role === 'user'))
    }

    const savedLanguage = sessionStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (isStoredLanguage(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], content: UI_STRINGS[language].welcome }]
      }
      return prev
    })
  }, [language])

  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, showEmergency])

  const handleSubmit = async (userMessage: string) => {
    setError(null)
    setShowEmergency(false)
    setHasUserAskedQuestion(true)
    stopSpeaking()

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    emitEvent('question_asked')

    try {
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-19)
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          messages: conversationHistory,
          language,
        }),
      })

      const data: ChatResponse & { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t.fallbackError)
      }

      if (data.isEmergency) {
        setShowEmergency(true)
        emitEvent('emergency_escalation')
        if (voiceOutEnabled && data.emergencyMessage) {
          speak({ text: data.emergencyMessage, language })
        }
      } else {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          isEmergency: false,
        }
        setMessages(prev => [...prev, assistantMsg])
        if (voiceOutEnabled && data.response) {
          speak({ text: data.response, language })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.fallbackError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = (next: Language) => {
    stopSpeaking()
    setLanguage(next)
    sessionStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    emitEvent('language_selected', { language: next })
  }

  const toggleVoiceOut = () => {
    if (voiceOutEnabled) stopSpeaking()
    setVoiceOutEnabled(!voiceOutEnabled)
  }

  const handleQuestionChip = (question: string) => {
    emitEvent('suggestion_clicked', { question })
    handleSubmit(question)
  }

  const handleFeedback = (messageId: string, feedback: 'helpful' | 'not_helpful') => {
    setMessages(prev => prev.map(message => (
      message.id === messageId ? { ...message, feedback } : message
    )))
    emitEvent('feedback_submitted', { messageId, feedback })
  }

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLeadStatus('saving')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leadName, phone: leadPhone, language }),
      })

      if (!response.ok) {
        setLeadStatus('error')
        return
      }

      setLeadStatus('saved')
      emitEvent('lead_submitted', { language })
    } catch {
      setLeadStatus('error')
    }
  }

  const renderQuestionChips = (questions: string[]) => (
    <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
      {questions.map(question => (
        <button
          key={question}
          type="button"
          onClick={() => handleQuestionChip(question)}
          disabled={isLoading}
          className="text-left bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-slate-700 text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-brand-50">
      <header className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-2.5 shrink-0">
        <div className="relative shrink-0">
          <img
            src="/dr-mekhala.webp"
            alt="Dr. Mekhala Iyengar"
            className="w-10 h-10 rounded-full object-cover object-top border border-brand-100"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-slate-800 leading-tight">Dr. Mekhala Iyengar</h1>
          <p className="text-xs text-brand-600 font-medium truncate">Gynaecologist & IVF Specialist · Indira IVF</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Primary CTAs — icon only */}
          <a
            href={`tel:${clinicPhone}`}
            onClick={() => emitEvent('call_clicked')}
            className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 flex items-center justify-center transition-colors"
            aria-label={`Call clinic at ${clinicPhone}`}
            title="Call Clinic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
          <a
            href={`https://wa.me/${clinicWhatsApp}`}
            onClick={() => emitEvent('whatsapp_clicked')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 flex items-center justify-center transition-colors"
            aria-label="WhatsApp the clinic"
            title="WhatsApp"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <a
            href={bookingUrl}
            onClick={() => emitEvent('booking_clicked')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Book a consultation"
            title="Book Consultation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </a>

          <div className="w-px h-5 bg-slate-200 mx-0.5" aria-hidden="true" />

          {ttsSupported && (
            <button
              type="button"
              onClick={toggleVoiceOut}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                voiceOutEnabled
                  ? 'bg-brand-50 text-brand-600'
                  : 'bg-slate-50 text-slate-400 hover:text-slate-600'
              }`}
              aria-label={voiceOutEnabled ? t.speakToggleOn : t.speakToggleOff}
              aria-pressed={voiceOutEnabled}
              title={voiceOutEnabled ? t.speakToggleOn : t.speakToggleOff}
            >
              {voiceOutEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5 9v6a1 1 0 001 1h3l4 4V4L9 8H6a1 1 0 00-1 1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 9v6a1 1 0 001 1h3l4 4V4L9 8H6a1 1 0 00-1 1zM17 9l4 6m0-6l-4 6" />
                </svg>
              )}
            </button>
          )}
          <label className="sr-only" htmlFor="language-select">
            {t.languageLabel}
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label={t.languageLabel}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeLabel}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4" aria-label="Chat messages" aria-live="polite">
        {showEmergency && (
          <EmergencyBanner clinicPhone={clinicPhone} clinicWhatsApp={clinicWhatsApp} language={language} />
        )}

        {messages.map((message, index) => (
          <div key={message.id}>
            <MessageBubble message={message} isLatest={index === messages.length - 1} />
            {message.role === 'assistant' && message.id !== 'welcome' && (
              <div className="mt-1 flex items-center gap-0.5 pl-1" aria-label="Rate assistant response">
                <button
                  type="button"
                  onClick={() => handleFeedback(message.id, 'helpful')}
                  className={`p-1.5 rounded transition-colors ${
                    message.feedback === 'helpful'
                      ? 'text-brand-600'
                      : 'text-slate-300 hover:text-brand-500'
                  }`}
                  aria-label="Mark response helpful"
                >
                  <svg className="w-3.5 h-3.5" fill={message.feedback === 'helpful' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-6 0v4H5a2 2 0 00-2 2v8a2 2 0 002 2h10.28a2 2 0 001.95-1.56l1.33-6A2 2 0 0016.61 11H14z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(message.id, 'not_helpful')}
                  className={`p-1.5 rounded transition-colors ${
                    message.feedback === 'not_helpful'
                      ? 'text-amber-500'
                      : 'text-slate-300 hover:text-amber-400'
                  }`}
                  aria-label="Mark response not helpful"
                >
                  <svg className="w-3.5 h-3.5 rotate-180" fill={message.feedback === 'not_helpful' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-6 0v4H5a2 2 0 00-2 2v8a2 2 0 002 2h10.28a2 2 0 001.95-1.56l1.33-6A2 2 0 0016.61 11H14z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        <TypingIndicator visible={isLoading} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <ClinicCTABar
              clinicPhone={clinicPhone}
              clinicWhatsApp={clinicWhatsApp}
              bookingUrl={bookingUrl}
              clinicLocationUrl={clinicLocationUrl}
              instagramUrl={instagramUrl}
              onCallClick={() => emitEvent('call_clicked')}
              onWhatsAppClick={() => emitEvent('whatsapp_clicked')}
              onBookingClick={() => emitEvent('booking_clicked')}
              onLocationClick={() => emitEvent('location_clicked')}
              onInstagramClick={() => emitEvent('instagram_clicked')}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <section className="shrink-0 border-t border-slate-100 bg-white px-4 pt-2 pb-1 shadow-[0_-8px_24px_rgba(15,23,42,0.04)]" aria-label="Chat actions">
        {(!hasUserAskedQuestion || (!isLoading && messages[messages.length - 1]?.role === 'assistant')) && (
          <div className="mb-2 max-h-20 overflow-y-auto">
            {!hasUserAskedQuestion && renderQuestionChips(STARTER_QUESTIONS)}
            {hasUserAskedQuestion && renderQuestionChips(FOLLOW_UP_QUESTIONS)}
          </div>
        )}
        <div className="flex items-center justify-end pb-1">
          {leadStatus === 'saved' ? (
            <span className="text-xs text-brand-700 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Callback request sent
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowCallbackDrawer(true)}
              className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 transition-colors py-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Request a callback
            </button>
          )}
        </div>
      </section>

      {/* Callback drawer */}
      {showCallbackDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={() => setShowCallbackDrawer(false)}
          aria-modal="true"
          role="dialog"
          aria-label="Request callback"
        >
          <div
            className="w-full bg-white rounded-t-2xl px-5 pt-5 pb-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Request a callback</h2>
                <p className="text-xs text-slate-500 mt-0.5">Share your details and the clinic team will follow up.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCallbackDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0 ml-4"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {leadStatus === 'saved' ? (
              <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
                Thank you. The clinic team has your callback request.
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3" aria-label="Request clinic callback">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={leadName}
                    onChange={(event) => setLeadName(event.target.value)}
                    placeholder="Name"
                    className="min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    aria-label="Name"
                    maxLength={80}
                  />
                  <input
                    value={leadPhone}
                    onChange={(event) => setLeadPhone(event.target.value)}
                    placeholder="Phone number"
                    inputMode="tel"
                    className="min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    aria-label="Phone number"
                    maxLength={20}
                  />
                </div>
                <button
                  type="submit"
                  disabled={leadStatus === 'saving' || !leadName.trim() || !leadPhone.trim()}
                  className="w-full min-h-[44px] rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-500 transition-colors"
                >
                  {leadStatus === 'saving' ? 'Sending…' : 'Send callback request'}
                </button>
                {leadStatus === 'error' && (
                  <p className="text-sm text-red-600">Please check your details and try again.</p>
                )}
              </form>
            )}

            {/* Secondary links */}
            <div className="flex gap-4 mt-5 pt-4 border-t border-slate-100">
              <a
                href={clinicLocationUrl}
                onClick={() => emitEvent('location_clicked')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Clinic location
              </a>
              <a
                href={instagramUrl}
                onClick={() => emitEvent('instagram_clicked')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <rect width="16" height="16" x="4" y="4" rx="4" strokeWidth={2} />
                  <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  <path strokeLinecap="round" strokeWidth={2} d="M17.5 6.5h.01" />
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      )}

      <ChatInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={false}
        language={language}
      />
    </div>
  )
}

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
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-slate-800 leading-tight">IVF Assistant</h1>
          <p className="text-xs text-slate-500 truncate">Dr. Mekhala&apos;s Fertility Clinic</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ttsSupported && (
            <button
              type="button"
              onClick={toggleVoiceOut}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                voiceOutEnabled
                  ? 'bg-teal-50 text-teal-600'
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
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            {message.role === 'assistant' && (
              <>
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
                {message.id !== 'welcome' && (
                  <div className="mt-2 flex items-center gap-2" aria-label="Rate assistant response">
                    <button
                      type="button"
                      onClick={() => handleFeedback(message.id, 'helpful')}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                        message.feedback === 'helpful'
                          ? 'bg-teal-50 border-teal-200 text-teal-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      aria-label="Mark response helpful"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-6 0v4H5a2 2 0 00-2 2v8a2 2 0 002 2h10.28a2 2 0 001.95-1.56l1.33-6A2 2 0 0016.61 11H14z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(message.id, 'not_helpful')}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                        message.feedback === 'not_helpful'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      aria-label="Mark response not helpful"
                    >
                      <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-6 0v4H5a2 2 0 00-2 2v8a2 2 0 002 2h10.28a2 2 0 001.95-1.56l1.33-6A2 2 0 0016.61 11H14z" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {!hasUserAskedQuestion && renderQuestionChips(STARTER_QUESTIONS)}

        {hasUserAskedQuestion && !isLoading && messages[messages.length - 1]?.role === 'assistant' && renderQuestionChips(FOLLOW_UP_QUESTIONS)}

        {leadStatus !== 'saved' && (
          <form
            onSubmit={handleLeadSubmit}
            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3"
            aria-label="Request clinic callback"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">Request a callback</p>
              <p className="text-xs text-slate-500">Share your details and the clinic team can follow up.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={leadName}
                onChange={(event) => setLeadName(event.target.value)}
                placeholder="Name"
                className="min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Name"
                maxLength={80}
              />
              <input
                value={leadPhone}
                onChange={(event) => setLeadPhone(event.target.value)}
                placeholder="Phone number"
                inputMode="tel"
                className="min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Phone number"
                maxLength={20}
              />
            </div>
            <button
              type="submit"
              disabled={leadStatus === 'saving' || !leadName.trim() || !leadPhone.trim()}
              className="min-h-[44px] rounded-lg bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-500"
            >
              {leadStatus === 'saving' ? 'Sending...' : 'Send callback request'}
            </button>
            {leadStatus === 'error' && (
              <p className="text-sm text-red-600">Please check your details and try again.</p>
            )}
          </form>
        )}

        {leadStatus === 'saved' && (
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-800">
            Thank you. The clinic team has your callback request.
          </div>
        )}

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

      <ChatInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={false}
        language={language}
      />
    </div>
  )
}

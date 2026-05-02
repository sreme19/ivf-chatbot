'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, ChatInterfaceProps, ChatResponse, Language } from '@/types'
import MessageBubble from '@/components/MessageBubble'
import TypingIndicator from '@/components/TypingIndicator'
import EmergencyBanner from '@/components/EmergencyBanner'
import ClinicCTABar from '@/components/ClinicCTABar'
import ChatInput from '@/components/ChatInput'
import { emitEvent } from '@/lib/analytics'
import { SUPPORTED_LANGUAGES, UI_STRINGS, DEFAULT_LANGUAGE } from '@/lib/i18n'
import { isSpeechSynthesisSupported, speak, stopSpeaking } from '@/lib/voice'

export default function ChatInterface({ clinicPhone, clinicWhatsApp, bookingUrl }: ChatInterfaceProps) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const t = UI_STRINGS[language]

  useEffect(() => {
    setTtsSupported(isSpeechSynthesisSupported())
    // Some browsers populate voice list asynchronously
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const sync = () => setTtsSupported(true)
      window.speechSynthesis.onvoiceschanged = sync
    }
    return () => {
      stopSpeaking()
    }
  }, [])

  // Update the welcome message when the user switches language (only if it's the only message)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], content: UI_STRINGS[language].welcome }]
      }
      return prev
    })
  }, [language])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, showEmergency])

  const handleSubmit = async (userMessage: string) => {
    setError(null)
    setShowEmergency(false)
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
  }

  const toggleVoiceOut = () => {
    if (voiceOutEnabled) stopSpeaking()
    setVoiceOutEnabled(!voiceOutEnabled)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
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

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4" aria-label="Chat messages" aria-live="polite">
        {/* Emergency Banner */}
        {showEmergency && (
          <EmergencyBanner clinicPhone={clinicPhone} clinicWhatsApp={clinicWhatsApp} language={language} />
        )}

        {/* Message list */}
        {messages.map((message, index) => (
          <div key={message.id}>
            <MessageBubble message={message} isLatest={index === messages.length - 1} />
            {message.role === 'assistant' && (
              <ClinicCTABar
                clinicPhone={clinicPhone}
                clinicWhatsApp={clinicWhatsApp}
                bookingUrl={bookingUrl}
                onCallClick={() => emitEvent('call_clicked')}
                onWhatsAppClick={() => emitEvent('whatsapp_clicked')}
                onBookingClick={() => emitEvent('booking_clicked')}
              />
            )}
          </div>
        ))}

        {/* Typing indicator */}
        <TypingIndicator visible={isLoading} />

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <ClinicCTABar
              clinicPhone={clinicPhone}
              clinicWhatsApp={clinicWhatsApp}
              bookingUrl={bookingUrl}
              onCallClick={() => emitEvent('call_clicked')}
              onWhatsAppClick={() => emitEvent('whatsapp_clicked')}
              onBookingClick={() => emitEvent('booking_clicked')}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <ChatInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={false}
        language={language}
      />
    </div>
  )
}

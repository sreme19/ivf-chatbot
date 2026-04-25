'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, ChatInterfaceProps, ChatResponse } from '@/types'
import MessageBubble from '@/components/MessageBubble'
import TypingIndicator from '@/components/TypingIndicator'
import EmergencyBanner from '@/components/EmergencyBanner'
import ClinicCTABar from '@/components/ClinicCTABar'
import ChatInput from '@/components/ChatInput'
import { emitEvent } from '@/lib/analytics'

export default function ChatInterface({ clinicPhone, clinicWhatsApp, bookingUrl }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello, I'm here to help you understand IVF and answer your questions. Please feel free to ask anything — there are no silly questions when it comes to your fertility journey. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [emergencyMessage, setEmergencyMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, showEmergency])

  const handleSubmit = async (userMessage: string) => {
    setError(null)
    setShowEmergency(false)

    // Add user message to state
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    // Emit analytics
    emitEvent('question_asked')

    try {
      // Build conversation history (last 20 messages, excluding welcome)
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
        }),
      })

      const data: ChatResponse & { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (data.isEmergency) {
        setShowEmergency(true)
        setEmergencyMessage(data.emergencyMessage || '')
        emitEvent('emergency_escalation')
      } else {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          isEmergency: false,
        }
        setMessages(prev => [...prev, assistantMsg])
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "I'm having trouble responding right now. Please contact the clinic directly."
      )
    } finally {
      setIsLoading(false)
    }
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
        <div>
          <h1 className="text-base font-semibold text-slate-800 leading-tight">IVF Assistant</h1>
          <p className="text-xs text-slate-500">Dr. Mekhala&apos;s Fertility Clinic</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4" aria-label="Chat messages" aria-live="polite">
        {/* Emergency Banner */}
        {showEmergency && (
          <EmergencyBanner clinicPhone={clinicPhone} clinicWhatsApp={clinicWhatsApp} />
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
      />
    </div>
  )
}

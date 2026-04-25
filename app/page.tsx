'use client'

import { useState, useEffect } from 'react'
import ConsentScreen from '@/components/ConsentScreen'
import ChatInterface from '@/components/ChatInterface'
import { emitEvent } from '@/lib/analytics'

const CONSENT_KEY = 'ivf_consent_accepted'

export default function Home() {
  const [consentAccepted, setConsentAccepted] = useState<boolean | null>(null)

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(CONSENT_KEY)
    setConsentAccepted(stored === 'true')
  }, [])

  const handleAccept = () => {
    sessionStorage.setItem(CONSENT_KEY, 'true')
    setConsentAccepted(true)
    emitEvent('chat_started')
  }

  // Avoid flash of wrong screen during hydration
  if (consentAccepted === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    )
  }

  if (!consentAccepted) {
    return <ConsentScreen onAccept={handleAccept} />
  }

  return (
    <ChatInterface
      clinicPhone={process.env.NEXT_PUBLIC_CLINIC_PHONE || ''}
      clinicWhatsApp={process.env.NEXT_PUBLIC_CLINIC_WHATSAPP || ''}
      bookingUrl={process.env.NEXT_PUBLIC_BOOKING_URL || '#'}
    />
  )
}

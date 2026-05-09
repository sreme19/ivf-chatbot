'use client'

import { useState, useEffect } from 'react'
import ConsentScreen from '@/components/ConsentScreen'
import ChatInterface from '@/components/ChatInterface'
import { emitEvent } from '@/lib/analytics'
import { Language } from '@/types'
import { DEFAULT_LANGUAGE } from '@/lib/i18n'

const CONSENT_KEY = 'ivf_consent_accepted'
const LANGUAGE_STORAGE_KEY = 'ivf_language'

function isStoredLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'hi' || value === 'kn'
}

export default function Home() {
  const [consentAccepted, setConsentAccepted] = useState<boolean | null>(null)
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(CONSENT_KEY)
    setConsentAccepted(stored === 'true')

    const savedLanguage = sessionStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (isStoredLanguage(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleAccept = () => {
    sessionStorage.setItem(CONSENT_KEY, 'true')
    setConsentAccepted(true)
    emitEvent('chat_started')
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    sessionStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
    emitEvent('language_selected')
  }

  // Avoid flash of wrong screen during hydration
  if (consentAccepted === null) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    )
  }

  if (!consentAccepted) {
    return <ConsentScreen onAccept={handleAccept} language={language} onLanguageChange={handleLanguageChange} />
  }

  return (
    <ChatInterface
      clinicPhone={process.env.NEXT_PUBLIC_CLINIC_PHONE || ''}
      bookingUrl={process.env.NEXT_PUBLIC_BOOKING_URL || '#'}
      clinicLocationUrl={process.env.NEXT_PUBLIC_CLINIC_LOCATION_URL || 'https://www.google.com/maps/search/?api=1&query=Indira+IVF+Rajajinagar'}
      instagramUrl={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/kicks_and_cries'}
    />
  )
}

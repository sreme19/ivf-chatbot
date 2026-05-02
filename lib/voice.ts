'use client'

import { Language } from '@/types'
import { VOICE_LOCALE } from '@/lib/i18n'

// The Web Speech API is not in the standard TS lib. We type just enough to use it.
interface SpeechRecognitionAlternativeShape {
  transcript: string
  confidence: number
}
interface SpeechRecognitionResultShape {
  isFinal: boolean
  0: SpeechRecognitionAlternativeShape
  length: number
}
interface SpeechRecognitionEventShape {
  resultIndex: number
  results: { length: number; [index: number]: SpeechRecognitionResultShape }
}
interface SpeechRecognitionErrorEventShape {
  error: string
  message?: string
}
interface SpeechRecognitionShape {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SpeechRecognitionEventShape) => void) | null
  onerror: ((e: SpeechRecognitionErrorEventShape) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionShape

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export interface VoiceRecognitionHandle {
  stop: () => void
}

export interface StartRecognitionOptions {
  language: Language
  onPartial?: (text: string) => void
  onFinal: (text: string) => void
  onError?: (error: string) => void
  onEnd?: () => void
}

export function startRecognition(opts: StartRecognitionOptions): VoiceRecognitionHandle | null {
  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) return null

  const recognition = new Ctor()
  recognition.lang = VOICE_LOCALE[opts.language]
  recognition.continuous = false
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  let finalTranscript = ''

  recognition.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const transcript = result[0].transcript
      if (result.isFinal) {
        finalTranscript += transcript
      } else {
        interim += transcript
      }
    }
    if (interim && opts.onPartial) opts.onPartial(interim)
  }

  recognition.onerror = (event) => {
    if (opts.onError) opts.onError(event.error)
  }

  recognition.onend = () => {
    const trimmed = finalTranscript.trim()
    if (trimmed) opts.onFinal(trimmed)
    if (opts.onEnd) opts.onEnd()
  }

  try {
    recognition.start()
  } catch (err) {
    if (opts.onError) opts.onError(err instanceof Error ? err.message : 'start-failed')
    return null
  }

  return {
    stop: () => {
      try {
        recognition.stop()
      } catch {
        // ignore
      }
    },
  }
}

// Strip markdown bold markers and other characters before speaking
function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function pickVoice(language: Language): SpeechSynthesisVoice | undefined {
  if (!isSpeechSynthesisSupported()) return undefined
  const locale = VOICE_LOCALE[language]
  const prefix = language // 'en' | 'hi' | 'kn'
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === locale) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix + '-')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
  )
}

export interface SpeakOptions {
  text: string
  language: Language
  onEnd?: () => void
  onError?: (error: string) => void
}

export function speak(opts: SpeakOptions): void {
  if (!isSpeechSynthesisSupported()) {
    if (opts.onError) opts.onError('unsupported')
    return
  }

  const cleaned = cleanForSpeech(opts.text)
  if (!cleaned) {
    if (opts.onEnd) opts.onEnd()
    return
  }

  // Cancel anything currently speaking
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(cleaned)
  utterance.lang = VOICE_LOCALE[opts.language]
  const voice = pickVoice(opts.language)
  if (voice) utterance.voice = voice
  utterance.rate = 1
  utterance.pitch = 1

  utterance.onend = () => {
    if (opts.onEnd) opts.onEnd()
  }
  utterance.onerror = (e) => {
    if (opts.onError) opts.onError((e as SpeechSynthesisErrorEvent).error || 'speech-error')
  }

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}

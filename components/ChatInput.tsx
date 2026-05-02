'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatInputProps } from '@/types'
import { UI_STRINGS } from '@/lib/i18n'
import {
  isSpeechRecognitionSupported,
  startRecognition,
  VoiceRecognitionHandle,
} from '@/lib/voice'
import { emitEvent } from '@/lib/analytics'

const MAX_CHARS = 1000
const WARN_CHARS = 500

export default function ChatInput({ onSubmit, isLoading, disabled, language }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<VoiceRecognitionHandle | null>(null)
  const t = UI_STRINGS[language]

  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported())
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
    }
  }, [language])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 4 + 24
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isLoading || trimmed.length > MAX_CHARS) return
    onSubmit(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
  }

  const startListening = () => {
    if (!voiceSupported || isListening || disabled || isLoading) return
    setVoiceError(null)
    emitEvent('voice_input_started', { language })

    const handle = startRecognition({
      language,
      onPartial: (text) => {
        setValue(text)
      },
      onFinal: (text) => {
        setValue(text)
        emitEvent('voice_input_completed', { language })
      },
      onError: (err) => {
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          setVoiceError(t.micPermissionDenied)
        } else if (err !== 'no-speech' && err !== 'aborted') {
          setVoiceError(t.voiceUnsupported)
        }
      },
      onEnd: () => {
        recognitionRef.current = null
        setIsListening(false)
      },
    })

    if (handle) {
      recognitionRef.current = handle
      setIsListening(true)
    } else {
      setVoiceError(t.voiceUnsupported)
    }
  }

  const isOverLimit = value.length > MAX_CHARS
  const isNearLimit = value.length >= WARN_CHARS

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-3 pb-safe">
      {voiceError && (
        <p className="text-xs mb-1 text-red-500" role="alert">
          {voiceError}
        </p>
      )}
      {isNearLimit && (
        <p className={`text-xs mb-1 text-right ${isOverLimit ? 'text-red-500' : 'text-amber-500'}`}>
          {value.length}/{MAX_CHARS} characters
        </p>
      )}
      <div className="flex items-end gap-2">
        {voiceSupported && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={disabled || isLoading}
            className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-150 min-h-[44px] min-w-[44px] ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isListening ? t.micStop : t.micStart}
            aria-pressed={isListening}
          >
            {isListening ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z" />
              </svg>
            )}
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={t.placeholder}
          rows={1}
          maxLength={MAX_CHARS + 1}
          className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed leading-6 min-h-[44px]"
          aria-label={t.placeholder}
          aria-multiline="true"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || isLoading || !value.trim() || isOverLimit}
          className="shrink-0 w-11 h-11 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors duration-150 min-h-[44px] min-w-[44px]"
          aria-label={t.send}
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

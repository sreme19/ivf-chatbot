'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatInputProps } from '@/types'

const MAX_CHARS = 1000
const WARN_CHARS = 500

export default function ChatInput({ onSubmit, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 4 + 24 // 4 lines + padding
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

  const isOverLimit = value.length > MAX_CHARS
  const isNearLimit = value.length >= WARN_CHARS

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-3 pb-safe">
      {isNearLimit && (
        <p className={`text-xs mb-1 text-right ${isOverLimit ? 'text-red-500' : 'text-amber-500'}`}>
          {value.length}/{MAX_CHARS} characters
        </p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder="Ask a question about IVF..."
          rows={1}
          maxLength={MAX_CHARS + 1}
          className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed leading-6 min-h-[44px]"
          aria-label="Type your IVF question here"
          aria-multiline="true"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || isLoading || !value.trim() || isOverLimit}
          className="shrink-0 w-11 h-11 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors duration-150 min-h-[44px] min-w-[44px]"
          aria-label="Send message"
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

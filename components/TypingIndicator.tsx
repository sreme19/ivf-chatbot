'use client'

interface TypingIndicatorProps {
  visible: boolean
}

export default function TypingIndicator({ visible }: TypingIndicatorProps) {
  if (!visible) return null

  return (
    <div
      className="flex justify-start"
      aria-label="Assistant is typing"
      aria-live="polite"
    >
      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

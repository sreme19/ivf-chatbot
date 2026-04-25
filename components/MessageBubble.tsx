'use client'

import { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isLatest: boolean
}

function renderContent(content: string): React.ReactNode {
  // Simple markdown: bold (**text**) and line breaks
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    // Handle line breaks
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ))
  })
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
      aria-label={`${isUser ? 'Your message' : 'Assistant message'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
          isUser
            ? 'bg-teal-600 text-white rounded-br-sm'
            : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm shadow-sm'
        }`}
      >
        {renderContent(message.content)}
      </div>
    </div>
  )
}

'use client'

import { Message } from '@/types'
import VideoCard from './VideoCard'

interface MessageBubbleProps {
  message: Message
  isLatest: boolean
  onSpeak?: (text: string) => void
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

export default function MessageBubble({ message, onSpeak }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className="flex flex-col" aria-label={`${isUser ? 'Your message' : 'Assistant message'}`}>
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
            isUser
              ? 'bg-brand-600 text-white rounded-br-sm'
              : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm shadow-sm'
          }`}
        >
          {renderContent(message.content)}
        </div>
      </div>
      {!isUser && onSpeak && (
        <button
          type="button"
          onClick={() => onSpeak(message.content)}
          className="mt-1 ml-1 p-1.5 rounded transition-colors text-slate-400 hover:text-brand-600"
          aria-label="Read message aloud"
          title="Read aloud"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13.5 4.06c0-1.336-1.616-2.256-2.73-1.72l-5.829 3.294A2 2 0 004 9.25v5.5a2 2 0 001.941 1.976l5.829 3.294c1.114.536 2.73-.384 2.73-1.72V4.06zM15.5 12c0-1.38.45-2.663 1.221-3.708.77 1.045 1.279 2.328 1.279 3.708 0 1.38-.508 2.663-1.279 3.708-.77-1.045-1.221-2.328-1.221-3.708zm2.025-8.02c.313.425.611.991.896 1.852.286.86.497 2.006.497 3.168 0 1.162-.211 2.307-.497 3.167-.285.86-.583 1.427-.896 1.852.341-.454.656-1.01.918-1.786.263-.776.45-1.802.45-2.833 0-1.03-.187-2.057-.45-2.833-.262-.776-.577-1.332-.918-1.786z" />
          </svg>
        </button>
      )}

      {/* Related videos */}
      {!isUser && message.videos && message.videos.length > 0 && (
        <div className="mt-3 w-full">
          <p className="text-xs font-medium text-slate-600 mb-2">📺 Related Videos:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {message.videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

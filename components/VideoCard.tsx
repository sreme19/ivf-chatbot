'use client'

import { Video } from '@/types'

interface VideoCardProps {
  video: Video
}

export default function VideoCard({ video }: VideoCardProps) {
  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const videoId = extractVideoId(video.youtubeUrl)
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '/placeholder-video.png'

  return (
    <a
      href={video.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-150 hover:border-brand-300"
    >
      <div className="relative bg-slate-100 aspect-video overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{video.channel}</p>
        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{video.description}</p>
      </div>
    </a>
  )
}

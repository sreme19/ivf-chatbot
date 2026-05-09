import fs from 'fs'
import path from 'path'

export interface Video {
  id: string
  title: string
  youtubeUrl: string
  duration: string
  channel: string
  description: string
  keywords: string[]
}

let cachedVideos: Video[] | null = null

export function getVideos(): Video[] {
  if (cachedVideos !== null) {
    return cachedVideos
  }

  try {
    const videoPath = path.join(process.cwd(), 'content', 'ivf-videos.json')
    const content = fs.readFileSync(videoPath, 'utf-8')
    cachedVideos = JSON.parse(content) as Video[]
    return cachedVideos
  } catch {
    console.warn('[video-loader] Failed to load videos, returning empty array')
    return []
  }
}

export function _resetVideoCache(): void {
  cachedVideos = null
}

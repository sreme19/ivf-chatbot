import { getVideos, Video } from './video-loader'

const MAX_VIDEOS = 2

function getTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(token => token.length > 2)
}

function scoreVideo(userMessage: string, video: Video): number {
  const messageTokens = getTokens(userMessage)
  const messageSet = new Set(messageTokens)

  // Keyword matches (highest weight)
  let score = 0
  const videoKeywords = video.keywords.map(k => k.toLowerCase())

  for (const keyword of videoKeywords) {
    const keywordTokens = getTokens(keyword)
    for (const token of keywordTokens) {
      if (messageSet.has(token)) {
        score += 3
      }
    }
  }

  // Title matches (medium weight)
  const titleTokens = getTokens(video.title)
  for (const token of titleTokens) {
    if (messageSet.has(token)) {
      score += 1.5
    }
  }

  // Description matches (low weight)
  const descTokens = getTokens(video.description)
  for (const token of descTokens) {
    if (messageSet.has(token)) {
      score += 0.5
    }
  }

  return score
}

export function retrieveVideos(userMessage: string): Video[] {
  if (!userMessage || typeof userMessage !== 'string') {
    return []
  }

  const videos = getVideos()
  if (videos.length === 0) {
    return []
  }

  // Score all videos
  const scored = videos.map(video => ({
    video,
    score: scoreVideo(userMessage, video),
  }))

  // Filter by minimum score threshold
  const threshold = 1.0
  const relevant = scored.filter(item => item.score >= threshold)

  // Sort by score and return top N
  return relevant
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_VIDEOS)
    .map(item => item.video)
}

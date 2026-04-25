import { FAQChunk } from '@/types'
import { getFAQChunks } from '@/lib/faq-loader'

export const MAX_CHUNKS = 3
const KEYWORD_MATCH_WEIGHT = 2
const TOKEN_MATCH_WEIGHT = 1

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 3)
}

interface ScoredChunk {
  chunk: FAQChunk
  score: number
}

export function retrieveContext(userMessage: string, chunks?: FAQChunk[]): FAQChunk[] {
  const faqChunks = chunks ?? getFAQChunks()

  if (!userMessage.trim() || faqChunks.length === 0) {
    return []
  }

  const normalizedQuery = userMessage.toLowerCase().trim()
  const queryTokens = tokenize(normalizedQuery)
  const scoredChunks: ScoredChunk[] = []

  for (const chunk of faqChunks) {
    let score = 0

    // Keyword overlap scoring (weight 2)
    for (const keyword of chunk.keywords) {
      if (normalizedQuery.includes(keyword)) {
        score += KEYWORD_MATCH_WEIGHT
      }
    }

    // Token overlap scoring (weight 1, tokens > 3 chars)
    const chunkContentLower = chunk.content.toLowerCase()
    for (const token of queryTokens) {
      if (chunkContentLower.includes(token)) {
        score += TOKEN_MATCH_WEIGHT
      }
    }

    if (score > 0) {
      scoredChunks.push({ chunk, score })
    }
  }

  // Sort by score descending
  scoredChunks.sort((a, b) => b.score - a.score)

  // Return top MAX_CHUNKS
  return scoredChunks.slice(0, MAX_CHUNKS).map(sc => sc.chunk)
}

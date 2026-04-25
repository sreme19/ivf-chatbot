import { FAQChunk } from '@/types'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'what', 'how', 'why', 'when', 'where',
  'who', 'which', 'that', 'this', 'these', 'those', 'if', 'it', 'its',
  'my', 'your', 'our', 'their', 'i', 'you', 'we', 'they', 'he', 'she',
])

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractKeywords(heading: string): string[] {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
}

export function parseFAQMarkdown(content: string): FAQChunk[] {
  const chunks: FAQChunk[] = []
  const lines = content.split('\n')

  let currentTopic = ''
  let currentHeading = ''
  let currentContentLines: string[] = []
  let chunkIndex = 0

  function flushChunk() {
    if (currentTopic && currentHeading && currentContentLines.length > 0) {
      const content = currentContentLines.join('\n').trim()
      if (content) {
        const topicSlug = slugify(currentTopic)
        const id = `${topicSlug}-${chunkIndex}`
        const keywords = [
          ...extractKeywords(currentHeading),
          ...extractKeywords(currentTopic),
        ]
        // Deduplicate keywords
        const uniqueKeywords = [...new Set(keywords)].filter(k => k.length > 0)

        chunks.push({
          id,
          topic: currentTopic,
          heading: currentHeading,
          content,
          keywords: uniqueKeywords.length > 0 ? uniqueKeywords : [slugify(currentHeading)],
        })
        chunkIndex++
      }
    }
    currentContentLines = []
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushChunk()
      currentTopic = line.replace(/^## /, '').trim()
      currentHeading = ''
    } else if (line.startsWith('### ')) {
      flushChunk()
      currentHeading = line.replace(/^### /, '').trim()
    } else {
      if (currentHeading) {
        currentContentLines.push(line)
      }
    }
  }

  // Flush the last chunk
  flushChunk()

  return chunks
}

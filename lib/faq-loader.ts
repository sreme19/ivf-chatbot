import fs from 'fs'
import path from 'path'
import { FAQChunk } from '@/types'
import { parseFAQMarkdown } from '@/lib/faq-parser'

const FAQ_FILE_PATH = path.join(process.cwd(), 'content', 'ivf-faq.md')

let cachedChunks: FAQChunk[] | null = null

export function getFAQChunks(): FAQChunk[] {
  if (cachedChunks !== null) {
    return cachedChunks
  }

  try {
    const content = fs.readFileSync(FAQ_FILE_PATH, 'utf-8')
    cachedChunks = parseFAQMarkdown(content)
    return cachedChunks
  } catch (error) {
    console.warn(
      '[faq-loader] Warning: Could not load FAQ file at',
      FAQ_FILE_PATH,
      '— running in fallback mode with empty knowledge base.',
      error instanceof Error ? error.message : String(error)
    )
    cachedChunks = []
    return cachedChunks
  }
}

// For testing: reset the cache
export function _resetFAQCache(): void {
  cachedChunks = null
}

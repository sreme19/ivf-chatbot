import { parseFAQMarkdown } from '@/lib/faq-parser'

const SAMPLE_MARKDOWN = `
## IVF Process

### What is IVF?
IVF is a fertility treatment where eggs are fertilised in a laboratory.

### How long does it take?
A cycle typically takes 4-6 weeks.

## Injections

### What injections are used?
Hormone injections stimulate the ovaries.
`

describe('parseFAQMarkdown', () => {
  it('returns an array of FAQChunk objects', () => {
    const chunks = parseFAQMarkdown(SAMPLE_MARKDOWN)
    expect(Array.isArray(chunks)).toBe(true)
    expect(chunks.length).toBeGreaterThan(0)
  })

  it('correctly parses topic and heading', () => {
    const chunks = parseFAQMarkdown(SAMPLE_MARKDOWN)
    expect(chunks[0].topic).toBe('IVF Process')
    expect(chunks[0].heading).toBe('What is IVF?')
  })

  it('correctly parses content', () => {
    const chunks = parseFAQMarkdown(SAMPLE_MARKDOWN)
    expect(chunks[0].content).toContain('fertility treatment')
  })

  it('assigns unique ids to each chunk', () => {
    const chunks = parseFAQMarkdown(SAMPLE_MARKDOWN)
    const ids = chunks.map(c => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('extracts keywords from heading', () => {
    const chunks = parseFAQMarkdown(SAMPLE_MARKDOWN)
    expect(chunks[0].keywords.length).toBeGreaterThan(0)
    expect(Array.isArray(chunks[0].keywords)).toBe(true)
  })

  it('each chunk has non-empty content', () => {
    const chunks = parseFAQMarkdown(SAMPLE_MARKDOWN)
    chunks.forEach(chunk => {
      expect(chunk.content.trim().length).toBeGreaterThan(0)
    })
  })

  it('each chunk has at least one keyword', () => {
    const chunks = parseFAQMarkdown(SAMPLE_MARKDOWN)
    chunks.forEach(chunk => {
      expect(chunk.keywords.length).toBeGreaterThan(0)
    })
  })

  it('handles empty content gracefully', () => {
    const chunks = parseFAQMarkdown('')
    expect(chunks).toEqual([])
  })

  it('handles content with no headings', () => {
    const chunks = parseFAQMarkdown('Just some plain text without headings')
    expect(chunks).toEqual([])
  })

  it('handles topic with no sub-headings', () => {
    const chunks = parseFAQMarkdown('## Topic Only\nNo sub-headings here')
    expect(chunks).toEqual([])
  })

  it('parses multiple topics correctly', () => {
    const chunks = parseFAQMarkdown(SAMPLE_MARKDOWN)
    const topics = [...new Set(chunks.map(c => c.topic))]
    expect(topics).toContain('IVF Process')
    expect(topics).toContain('Injections')
  })
})

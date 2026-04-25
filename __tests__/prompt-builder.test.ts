import { buildSystemPrompt, SYSTEM_PROMPT_BASE } from '@/lib/prompt-builder'
import { FAQChunk } from '@/types'

const MOCK_CHUNKS: FAQChunk[] = [
  {
    id: 'ivf-0',
    topic: 'IVF Process',
    heading: 'What is IVF?',
    content: 'IVF is a fertility treatment.',
    keywords: ['ivf', 'fertility'],
  },
]

describe('buildSystemPrompt', () => {
  it('returns a non-empty string', () => {
    expect(buildSystemPrompt([]).length).toBeGreaterThan(0)
    expect(buildSystemPrompt(MOCK_CHUNKS).length).toBeGreaterThan(0)
  })

  it('includes the base system prompt in all cases', () => {
    expect(buildSystemPrompt([])).toContain('compassionate IVF education assistant')
    expect(buildSystemPrompt(MOCK_CHUNKS)).toContain('compassionate IVF education assistant')
  })

  it('includes chunk content when chunks are provided', () => {
    const result = buildSystemPrompt(MOCK_CHUNKS)
    expect(result).toContain('IVF Process')
    expect(result).toContain('IVF is a fertility treatment.')
    expect(result).toContain('RELEVANT KNOWLEDGE BASE CONTEXT')
  })

  it('includes fallback instruction when no chunks provided', () => {
    const result = buildSystemPrompt([])
    expect(result).toContain('No specific knowledge base content matched this query')
    expect(result).toContain('contact the clinic')
  })

  it('does not include chunk content when no chunks provided', () => {
    const result = buildSystemPrompt([])
    expect(result).not.toContain('RELEVANT KNOWLEDGE BASE CONTEXT')
  })

  it('includes all chunk topics when multiple chunks provided', () => {
    const multiChunks: FAQChunk[] = [
      { id: 'a-0', topic: 'Topic A', heading: 'Heading A', content: 'Content A', keywords: ['a'] },
      { id: 'b-1', topic: 'Topic B', heading: 'Heading B', content: 'Content B', keywords: ['b'] },
    ]
    const result = buildSystemPrompt(multiChunks)
    expect(result).toContain('Topic A')
    expect(result).toContain('Topic B')
    expect(result).toContain('Content A')
    expect(result).toContain('Content B')
  })
})

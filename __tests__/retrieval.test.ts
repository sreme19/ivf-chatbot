import { retrieveContext, MAX_CHUNKS } from '@/lib/retrieval'
import { FAQChunk } from '@/types'

const MOCK_CHUNKS: FAQChunk[] = [
  {
    id: 'ivf-process-0',
    topic: 'IVF Process',
    heading: 'What is IVF?',
    content: 'IVF is a fertility treatment where eggs are fertilised in a laboratory.',
    keywords: ['ivf', 'fertility', 'treatment'],
  },
  {
    id: 'pcos-1',
    topic: 'PCOS and IVF',
    heading: 'What is PCOS?',
    content: 'PCOS is a hormonal condition affecting the ovaries and fertility.',
    keywords: ['pcos', 'hormonal', 'ovaries'],
  },
  {
    id: 'embryo-2',
    topic: 'Embryo Transfer',
    heading: 'What is embryo transfer?',
    content: 'Embryo transfer places embryos into the uterus after fertilisation.',
    keywords: ['embryo', 'transfer', 'uterus'],
  },
  {
    id: 'injections-3',
    topic: 'Injections',
    heading: 'What injections are used?',
    content: 'Hormone injections stimulate the ovaries to produce eggs.',
    keywords: ['injections', 'hormone', 'stimulate'],
  },
]

describe('retrieveContext', () => {
  it('returns relevant chunks for a matching query', () => {
    const results = retrieveContext('What is IVF?', MOCK_CHUNKS)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].topic).toBe('IVF Process')
  })

  it('returns empty array when no chunks match', () => {
    const results = retrieveContext('What is the weather today?', MOCK_CHUNKS)
    expect(results).toEqual([])
  })

  it('never returns more than MAX_CHUNKS results', () => {
    const results = retrieveContext('ivf fertility treatment embryo', MOCK_CHUNKS)
    expect(results.length).toBeLessThanOrEqual(MAX_CHUNKS)
  })

  it('returns results ordered by score (highest first)', () => {
    // Query specifically about PCOS
    const results = retrieveContext('PCOS hormonal ovaries condition', MOCK_CHUNKS)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].topic).toBe('PCOS and IVF')
  })

  it('returns empty array for empty query', () => {
    const results = retrieveContext('', MOCK_CHUNKS)
    expect(results).toEqual([])
  })

  it('returns empty array for whitespace-only query', () => {
    const results = retrieveContext('   ', MOCK_CHUNKS)
    expect(results).toEqual([])
  })

  it('returns empty array when chunks array is empty', () => {
    const results = retrieveContext('IVF treatment', [])
    expect(results).toEqual([])
  })

  it('each returned chunk exists in the original chunks array', () => {
    const results = retrieveContext('IVF embryo transfer', MOCK_CHUNKS)
    results.forEach(result => {
      expect(MOCK_CHUNKS.some(c => c.id === result.id)).toBe(true)
    })
  })
})

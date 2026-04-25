import * as fc from 'fast-check'
import { retrieveContext, MAX_CHUNKS } from '@/lib/retrieval'
import { FAQChunk } from '@/types'

/**
 * Validates: Requirements 2.5 (Retrieval Engine)
 * Property-based tests for retrieveContext function.
 */

const SAMPLE_CHUNKS: FAQChunk[] = [
  { id: 'chunk-0', topic: 'IVF', heading: 'What is IVF', content: 'IVF is a fertility treatment', keywords: ['ivf', 'fertility'] },
  { id: 'chunk-1', topic: 'PCOS', heading: 'What is PCOS', content: 'PCOS affects the ovaries', keywords: ['pcos', 'ovaries'] },
  { id: 'chunk-2', topic: 'Embryo', heading: 'Embryo transfer', content: 'Embryo is placed in uterus', keywords: ['embryo', 'uterus'] },
  { id: 'chunk-3', topic: 'Injections', heading: 'Hormone injections', content: 'Injections stimulate ovaries', keywords: ['injections', 'hormone'] },
  { id: 'chunk-4', topic: 'Cost', heading: 'IVF cost', content: 'Cost varies by clinic', keywords: ['cost', 'clinic'] },
]

describe('retrieveContext property-based tests', () => {
  it('result length is always <= MAX_CHUNKS', () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        const results = retrieveContext(query, SAMPLE_CHUNKS)
        return results.length <= MAX_CHUNKS
      }),
      { numRuns: 200 }
    )
  })

  it('all returned chunks exist in the original chunks array', () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        const results = retrieveContext(query, SAMPLE_CHUNKS)
        return results.every(r => SAMPLE_CHUNKS.some(c => c.id === r.id))
      }),
      { numRuns: 200 }
    )
  })

  it('result is always an array', () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        const results = retrieveContext(query, SAMPLE_CHUNKS)
        return Array.isArray(results)
      }),
      { numRuns: 200 }
    )
  })

  it('no duplicate chunks in results', () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        const results = retrieveContext(query, SAMPLE_CHUNKS)
        const ids = results.map(r => r.id)
        return ids.length === new Set(ids).size
      }),
      { numRuns: 200 }
    )
  })
})

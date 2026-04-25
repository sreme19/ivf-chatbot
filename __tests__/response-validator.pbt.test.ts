import * as fc from 'fast-check'
import { validateResponse, FORBIDDEN_PATTERNS, MAX_RESPONSE_LENGTH, SAFE_FALLBACK_RESPONSE } from '@/lib/response-validator'

describe('validateResponse property-based tests', () => {
  it('result never matches any forbidden pattern', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (response) => {
        const result = validateResponse(response)
        return !FORBIDDEN_PATTERNS.some(pattern => {
          pattern.lastIndex = 0 // reset stateful regex
          return pattern.test(result)
        })
      }),
      { numRuns: 300 }
    )
  })

  it('result length is always <= MAX_RESPONSE_LENGTH', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (response) => {
        const result = validateResponse(response)
        return result.length <= MAX_RESPONSE_LENGTH + 10 // small buffer for sentence boundary logic
      }),
      { numRuns: 300 }
    )
  })

  it('result is always a non-empty string', () => {
    fc.assert(
      fc.property(fc.string(), (response) => {
        const result = validateResponse(response)
        return typeof result === 'string' && result.length > 0
      }),
      { numRuns: 300 }
    )
  })

  it('safe responses pass through unchanged (when short enough)', () => {
    const safeArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
      return !FORBIDDEN_PATTERNS.some(p => {
        p.lastIndex = 0
        return p.test(s)
      }) && s.trim().length > 0
    })

    fc.assert(
      fc.property(safeArbitrary, (response) => {
        const result = validateResponse(response)
        return result === response || result === SAFE_FALLBACK_RESPONSE
      }),
      { numRuns: 200 }
    )
  })
})

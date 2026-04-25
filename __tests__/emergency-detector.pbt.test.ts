import * as fc from 'fast-check'
import { detectEmergency, EMERGENCY_KEYWORDS } from '@/lib/emergency-detector'

describe('detectEmergency property-based tests', () => {
  it('any string with no emergency keywords returns isEmergency: false', () => {
    // Generate strings that don't contain any emergency keywords
    const safeArbitrary = fc.string().filter(s => {
      const lower = s.toLowerCase()
      return !EMERGENCY_KEYWORDS.some(kw => lower.includes(kw))
    })

    fc.assert(
      fc.property(safeArbitrary, (msg) => {
        const result = detectEmergency(msg)
        return result.isEmergency === false
      }),
      { numRuns: 200 }
    )
  })

  it('any string containing an emergency keyword returns isEmergency: true', () => {
    const keywordArbitrary = fc.constantFrom(...EMERGENCY_KEYWORDS)
    const prefixArbitrary = fc.string({ maxLength: 20 })
    const suffixArbitrary = fc.string({ maxLength: 20 })

    fc.assert(
      fc.property(keywordArbitrary, prefixArbitrary, suffixArbitrary, (keyword, prefix, suffix) => {
        const msg = `${prefix} ${keyword} ${suffix}`
        const result = detectEmergency(msg)
        return result.isEmergency === true
      }),
      { numRuns: 200 }
    )
  })

  it('matchedKeywords is always a subset of EMERGENCY_KEYWORDS', () => {
    fc.assert(
      fc.property(fc.string(), (msg) => {
        const result = detectEmergency(msg)
        return result.matchedKeywords.every(kw => EMERGENCY_KEYWORDS.includes(kw))
      }),
      { numRuns: 200 }
    )
  })

  it('isEmergency is true iff matchedKeywords is non-empty', () => {
    fc.assert(
      fc.property(fc.string(), (msg) => {
        const result = detectEmergency(msg)
        return result.isEmergency === (result.matchedKeywords.length > 0)
      }),
      { numRuns: 200 }
    )
  })
})

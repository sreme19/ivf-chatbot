import { validateResponse, SAFE_FALLBACK_RESPONSE, MAX_RESPONSE_LENGTH, FORBIDDEN_PATTERNS } from '@/lib/response-validator'

describe('validateResponse', () => {
  describe('safe passthrough', () => {
    it('returns the response unchanged when it is safe and short', () => {
      const safe = 'IVF is a fertility treatment that involves egg retrieval and embryo transfer.'
      expect(validateResponse(safe)).toBe(safe)
    })

    it('returns safe fallback for empty string', () => {
      expect(validateResponse('')).toBe(SAFE_FALLBACK_RESPONSE)
    })

    it('returns safe fallback for whitespace-only string', () => {
      expect(validateResponse('   ')).toBe(SAFE_FALLBACK_RESPONSE)
    })
  })

  describe('forbidden pattern detection', () => {
    it('replaces response containing dosage instruction (mg)', () => {
      const unsafe = 'You should take 150mg of this medication daily.'
      expect(validateResponse(unsafe)).toBe(SAFE_FALLBACK_RESPONSE)
    })

    it('replaces response containing dosage instruction (IU)', () => {
      const unsafe = 'The doctor may ask you to take 75 IU of Gonal-F.'
      expect(validateResponse(unsafe)).toBe(SAFE_FALLBACK_RESPONSE)
    })

    it('replaces response interpreting AMH', () => {
      const unsafe = 'Your AMH is low, which means your ovarian reserve is reduced.'
      expect(validateResponse(unsafe)).toBe(SAFE_FALLBACK_RESPONSE)
    })

    it('replaces response interpreting beta-hCG', () => {
      const unsafe = 'Your beta-hCG level suggests a positive result.'
      expect(validateResponse(unsafe)).toBe(SAFE_FALLBACK_RESPONSE)
    })

    it('replaces response making a diagnosis', () => {
      const unsafe = 'You have OHSS based on your symptoms.'
      expect(validateResponse(unsafe)).toBe(SAFE_FALLBACK_RESPONSE)
    })

    it('replaces response with prescription-like language', () => {
      const unsafe = 'You should stop taking progesterone immediately.'
      expect(validateResponse(unsafe)).toBe(SAFE_FALLBACK_RESPONSE)
    })
  })

  describe('length truncation', () => {
    it('truncates responses longer than MAX_RESPONSE_LENGTH', () => {
      const longResponse = 'This is a safe sentence. '.repeat(100)
      const result = validateResponse(longResponse)
      expect(result.length).toBeLessThanOrEqual(MAX_RESPONSE_LENGTH + 10) // small buffer for sentence boundary
    })

    it('does not truncate responses within MAX_RESPONSE_LENGTH', () => {
      const shortResponse = 'This is a short, safe response.'
      expect(validateResponse(shortResponse)).toBe(shortResponse)
    })
  })

  describe('safe fallback is non-empty', () => {
    it('SAFE_FALLBACK_RESPONSE is non-empty', () => {
      expect(SAFE_FALLBACK_RESPONSE.length).toBeGreaterThan(0)
    })
  })
})

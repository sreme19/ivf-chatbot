import { detectEmergency, EMERGENCY_KEYWORDS } from '@/lib/emergency-detector'

describe('detectEmergency', () => {
  describe('emergency detection', () => {
    it('detects severe abdominal pain', () => {
      expect(detectEmergency('I have severe abdominal pain').isEmergency).toBe(true)
    })

    it('detects heavy bleeding', () => {
      expect(detectEmergency('I am experiencing heavy bleeding').isEmergency).toBe(true)
    })

    it('detects fainting', () => {
      expect(detectEmergency('I keep fainting').isEmergency).toBe(true)
    })

    it('detects fever', () => {
      expect(detectEmergency('I have a high fever').isEmergency).toBe(true)
    })

    it('detects breathlessness', () => {
      expect(detectEmergency('I have breathlessness').isEmergency).toBe(true)
    })

    it('detects difficulty breathing', () => {
      expect(detectEmergency('I am having difficulty breathing').isEmergency).toBe(true)
    })

    it('detects severe vomiting', () => {
      expect(detectEmergency('I have severe vomiting').isEmergency).toBe(true)
    })

    it('detects self-harm', () => {
      expect(detectEmergency('I am thinking about self-harm').isEmergency).toBe(true)
    })

    it('detects want to die', () => {
      expect(detectEmergency('I want to die').isEmergency).toBe(true)
    })

    it('detects suicidal', () => {
      expect(detectEmergency('I am feeling suicidal').isEmergency).toBe(true)
    })

    it('detects emergency keyword', () => {
      expect(detectEmergency('This is an emergency').isEmergency).toBe(true)
    })

    it('detects ambulance keyword', () => {
      expect(detectEmergency('I need an ambulance').isEmergency).toBe(true)
    })
  })

  describe('case insensitivity', () => {
    it('detects uppercase emergency keywords', () => {
      expect(detectEmergency('I HAVE SEVERE ABDOMINAL PAIN').isEmergency).toBe(true)
    })

    it('detects mixed case emergency keywords', () => {
      expect(detectEmergency('I Have Heavy Bleeding').isEmergency).toBe(true)
    })
  })

  describe('safe messages (no false positives)', () => {
    it('does not trigger for normal IVF question', () => {
      expect(detectEmergency('What is IVF?').isEmergency).toBe(false)
    })

    it('does not trigger for egg retrieval question', () => {
      expect(detectEmergency('What happens during egg retrieval?').isEmergency).toBe(false)
    })

    it('does not trigger for emotional support question', () => {
      expect(detectEmergency('I am feeling anxious about my cycle').isEmergency).toBe(false)
    })

    it('does not trigger for cost question', () => {
      expect(detectEmergency('How much does IVF cost?').isEmergency).toBe(false)
    })

    it('does not trigger for PCOS question', () => {
      expect(detectEmergency('I have PCOS, can I do IVF?').isEmergency).toBe(false)
    })
  })

  describe('empty and edge cases', () => {
    it('returns isEmergency false for empty string', () => {
      const result = detectEmergency('')
      expect(result.isEmergency).toBe(false)
      expect(result.matchedKeywords).toEqual([])
    })

    it('returns matched keywords in result', () => {
      const result = detectEmergency('I have severe abdominal pain and I am fainting')
      expect(result.isEmergency).toBe(true)
      expect(result.matchedKeywords.length).toBeGreaterThan(0)
    })

    it('does not mutate the input message', () => {
      const message = 'I have severe abdominal pain'
      const original = message
      detectEmergency(message)
      expect(message).toBe(original)
    })
  })
})

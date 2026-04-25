import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

// Mock Anthropic SDK — factory must be self-contained (jest.mock is hoisted)
jest.mock('@anthropic-ai/sdk', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'IVF is a fertility treatment that helps couples conceive.' }],
  })
  const MockAnthropic = jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }))
  // Attach mockCreate so tests can access it via jest.requireMock
  MockAnthropic._mockCreate = mockCreate
  return { __esModule: true, default: MockAnthropic }
})

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-api-key'
process.env.CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'

function getMockAnthropic() {
  return jest.requireMock('@anthropic-ai/sdk').default as jest.MockedFunction<any> & { _mockCreate: jest.Mock }
}

// Reset the mock to default successful implementation before each test
beforeEach(() => {
  const MockAnthropic = getMockAnthropic()
  const mockCreate = MockAnthropic._mockCreate
  mockCreate.mockResolvedValue({
    content: [{ type: 'text', text: 'IVF is a fertility treatment that helps couples conceive.' }],
  })
  MockAnthropic.mockImplementation(() => ({
    messages: { create: mockCreate },
  }))
})

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/chat', () => {
  describe('input validation', () => {
    it('returns 400 for empty userMessage', async () => {
      const req = makeRequest({ userMessage: '', messages: [] })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('returns 400 for missing userMessage', async () => {
      const req = makeRequest({ messages: [] })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('returns 400 for userMessage over 1000 chars', async () => {
      const req = makeRequest({ userMessage: 'a'.repeat(1001), messages: [] })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('returns 400 for messages array over 20 items', async () => {
      const messages = Array.from({ length: 21 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `message ${i}`,
      }))
      const req = makeRequest({ userMessage: 'What is IVF?', messages })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })
  })

  describe('emergency escalation', () => {
    it('returns isEmergency: true for emergency message without calling Claude', async () => {
      const MockAnthropic = getMockAnthropic()
      const localMockCreate = jest.fn()
      MockAnthropic.mockImplementation(() => ({ messages: { create: localMockCreate } }))

      const req = makeRequest({ userMessage: 'I have severe abdominal pain', messages: [] })
      const res = await POST(req)
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.isEmergency).toBe(true)
      expect(body.emergencyMessage).toBeTruthy()
      expect(localMockCreate).not.toHaveBeenCalled()
    })
  })

  describe('normal chat flow', () => {
    it('returns valid response for normal IVF question', async () => {
      const req = makeRequest({ userMessage: 'What is IVF?', messages: [] })
      const res = await POST(req)
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.isEmergency).toBe(false)
      expect(typeof body.response).toBe('string')
      expect(body.response.length).toBeGreaterThan(0)
    })
  })

  describe('API error handling', () => {
    it('returns 503 when Claude API throws an error', async () => {
      const MockAnthropic = getMockAnthropic()
      MockAnthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockRejectedValue(new Error('API Error')),
        },
      }))

      const req = makeRequest({ userMessage: 'What is IVF?', messages: [] })
      const res = await POST(req)
      expect(res.status).toBe(503)
    })
  })
})

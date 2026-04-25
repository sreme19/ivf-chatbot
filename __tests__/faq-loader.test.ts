import { getFAQChunks, _resetFAQCache } from '@/lib/faq-loader'
import fs from 'fs'

jest.mock('fs')
jest.mock('@/lib/faq-parser', () => ({
  parseFAQMarkdown: jest.fn((content: string) => {
    if (content === 'mock content') {
      return [{ id: 'test-0', topic: 'Test', heading: 'Test heading', content: 'Test content', keywords: ['test'] }]
    }
    return []
  }),
}))

const mockFs = fs as jest.Mocked<typeof fs>

describe('getFAQChunks', () => {
  beforeEach(() => {
    _resetFAQCache()
    jest.clearAllMocks()
  })

  it('returns parsed chunks when file exists', () => {
    mockFs.readFileSync.mockReturnValue('mock content' as unknown as Buffer)
    const chunks = getFAQChunks()
    expect(chunks.length).toBe(1)
    expect(chunks[0].topic).toBe('Test')
  })

  it('returns empty array when file does not exist', () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory')
    })
    const chunks = getFAQChunks()
    expect(chunks).toEqual([])
  })

  it('caches the result on subsequent calls', () => {
    mockFs.readFileSync.mockReturnValue('mock content' as unknown as Buffer)
    getFAQChunks()
    getFAQChunks()
    expect(mockFs.readFileSync).toHaveBeenCalledTimes(1)
  })

  it('returns empty array gracefully on any error', () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('Permission denied')
    })
    const chunks = getFAQChunks()
    expect(Array.isArray(chunks)).toBe(true)
    expect(chunks.length).toBe(0)
  })
})

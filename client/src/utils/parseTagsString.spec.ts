import { describe, it, expect } from 'vitest'

// Helper function that we're testing (from NodeForm.tsx)
function parseTagsString(str: string): string[] {
  return str
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

describe('parseTagsString utility', () => {
  it('should parse comma-separated tags correctly', () => {
    const result = parseTagsString('tag1,tag2,tag3')
    expect(result).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should handle tags with whitespace', () => {
    const result = parseTagsString(' tag1 , tag2 , tag3 ')
    expect(result).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should filter out empty tags', () => {
    const result = parseTagsString('tag1,,tag2,,,tag3,')
    expect(result).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should handle empty string', () => {
    const result = parseTagsString('')
    expect(result).toEqual([])
  })

  it('should handle string with only commas and spaces', () => {
    const result = parseTagsString('   ,  ,   ,  ')
    expect(result).toEqual([])
  })

  it('should handle single tag', () => {
    const result = parseTagsString('single-tag')
    expect(result).toEqual(['single-tag'])
  })

  it('should handle single tag with whitespace', () => {
    const result = parseTagsString('  single-tag  ')
    expect(result).toEqual(['single-tag'])
  })

  it('should handle tags with special characters', () => {
    const result = parseTagsString('tag-1, tag_2, tag.3, tag@4')
    expect(result).toEqual(['tag-1', 'tag_2', 'tag.3', 'tag@4'])
  })

  it('should handle tags with numbers', () => {
    const result = parseTagsString('2024, v1.0, milestone-2')
    expect(result).toEqual(['2024', 'v1.0', 'milestone-2'])
  })

  it('should preserve Unicode characters', () => {
    const result = parseTagsString('日本語, français, español')
    expect(result).toEqual(['日本語', 'français', 'español'])
  })

  it('should handle very long tag strings', () => {
    const longTags = Array.from({ length: 100 }, (_, i) => `tag${i}`).join(', ')
    const result = parseTagsString(longTags)
    expect(result).toHaveLength(100)
    expect(result[0]).toBe('tag0')
    expect(result[99]).toBe('tag99')
  })
})
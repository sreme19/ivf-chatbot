import { EmergencyResult } from '@/types'

export const EMERGENCY_KEYWORDS: string[] = [
  'severe abdominal pain',
  'severe pain',
  'heavy bleeding',
  'bleeding heavily',
  'fainting',
  'fainted',
  'passed out',
  'high fever',
  'fever',
  'breathlessness',
  "can't breathe",
  'cannot breathe',
  'difficulty breathing',
  'severe vomiting',
  'vomiting blood',
  'self-harm',
  'self harm',
  'hurt myself',
  'want to die',
  'suicidal',
  'end my life',
  'kill myself',
  'emergency',
  'ambulance',
]

export function detectEmergency(userMessage: string): EmergencyResult {
  const normalizedMessage = userMessage.toLowerCase().trim()
  const matchedKeywords: string[] = []

  for (const keyword of EMERGENCY_KEYWORDS) {
    if (normalizedMessage.includes(keyword)) {
      matchedKeywords.push(keyword)
    }
  }

  return {
    isEmergency: matchedKeywords.length > 0,
    matchedKeywords,
  }
}

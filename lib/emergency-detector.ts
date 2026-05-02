import { EmergencyResult } from '@/types'

export const EMERGENCY_KEYWORDS: string[] = [
  // English
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
  // Hindi (Devanagari)
  'तेज़ दर्द',
  'तेज दर्द',
  'भारी रक्तस्राव',
  'बहुत खून',
  'खून बह रहा',
  'बेहोश',
  'बेहोशी',
  'तेज़ बुखार',
  'तेज बुखार',
  'साँस नहीं',
  'सांस नहीं',
  'साँस लेने में',
  'सांस लेने में',
  'खून की उल्टी',
  'जान देना',
  'खुदकुशी',
  'आत्महत्या',
  'मरना चाहता',
  'मरना चाहती',
  'एम्बुलेंस',
  'आपातकाल',
  // Kannada
  'ತೀವ್ರ ನೋವು',
  'ಹೆಚ್ಚು ರಕ್ತಸ್ರಾವ',
  'ಭಾರೀ ರಕ್ತಸ್ರಾವ',
  'ಪ್ರಜ್ಞೆ ತಪ್ಪಿ',
  'ಮೂರ್ಛೆ',
  'ತೀವ್ರ ಜ್ವರ',
  'ಉಸಿರಾಡಲು',
  'ಉಸಿರಾಟದ ತೊಂದರೆ',
  'ರಕ್ತ ವಾಂತಿ',
  'ಆತ್ಮಹತ್ಯೆ',
  'ಸಾಯಬೇಕು',
  'ಆಂಬುಲೆನ್ಸ್',
  'ತುರ್ತು',
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

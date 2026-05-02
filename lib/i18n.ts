import { Language } from '@/types'

export const SUPPORTED_LANGUAGES: ReadonlyArray<{ code: Language; label: string; nativeLabel: string }> = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
]

// BCP 47 locale codes for Web Speech API (recognition + synthesis)
export const VOICE_LOCALE: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
}

// Friendly English name passed to Claude in the system prompt
export const LANGUAGE_NAME: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
}

interface UIStrings {
  welcome: string
  placeholder: string
  send: string
  micStart: string
  micStop: string
  speak: string
  stopSpeaking: string
  speakToggleOn: string
  speakToggleOff: string
  languageLabel: string
  emergencyTitle: string
  emergencyBody: string
  callNow: string
  whatsAppNow: string
  voiceUnsupported: string
  micPermissionDenied: string
  fallbackError: string
}

export const UI_STRINGS: Record<Language, UIStrings> = {
  en: {
    welcome:
      "Hello, I'm here to help you understand IVF and answer your questions. Please feel free to ask anything — there are no silly questions when it comes to your fertility journey. How can I help you today?",
    placeholder: 'Ask a question about IVF...',
    send: 'Send message',
    micStart: 'Speak your question',
    micStop: 'Stop recording',
    speak: 'Listen to reply',
    stopSpeaking: 'Stop speaking',
    speakToggleOn: 'Voice replies on',
    speakToggleOff: 'Voice replies off',
    languageLabel: 'Language',
    emergencyTitle: 'Urgent — Please seek help now',
    emergencyBody:
      'Please contact the clinic immediately or seek emergency care. Do not wait — your health and safety come first.',
    callNow: 'Call Now',
    whatsAppNow: 'WhatsApp Now',
    voiceUnsupported: 'Voice input is not supported in this browser',
    micPermissionDenied: 'Microphone permission denied. Please allow access and try again.',
    fallbackError: "I'm having trouble responding right now. Please contact the clinic directly.",
  },
  hi: {
    welcome:
      'नमस्ते, मैं आपको IVF को समझने और आपके सवालों के जवाब देने के लिए यहाँ हूँ। आप कुछ भी पूछ सकते हैं — आपकी फर्टिलिटी यात्रा में कोई भी सवाल छोटा नहीं है। मैं आपकी कैसे मदद कर सकता हूँ?',
    placeholder: 'IVF के बारे में सवाल पूछें...',
    send: 'भेजें',
    micStart: 'अपना सवाल बोलें',
    micStop: 'रिकॉर्डिंग रोकें',
    speak: 'जवाब सुनें',
    stopSpeaking: 'बोलना बंद करें',
    speakToggleOn: 'आवाज़ चालू है',
    speakToggleOff: 'आवाज़ बंद है',
    languageLabel: 'भाषा',
    emergencyTitle: 'तुरंत मदद लें',
    emergencyBody:
      'कृपया तुरंत क्लिनिक से संपर्क करें या आपातकालीन देखभाल लें। प्रतीक्षा न करें — आपकी सेहत और सुरक्षा सबसे पहले है।',
    callNow: 'अभी कॉल करें',
    whatsAppNow: 'व्हाट्सऐप करें',
    voiceUnsupported: 'इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है',
    micPermissionDenied: 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया अनुमति दें और पुनः प्रयास करें।',
    fallbackError: 'अभी जवाब देने में दिक्कत हो रही है। कृपया सीधे क्लिनिक से संपर्क करें।',
  },
  kn: {
    welcome:
      'ನಮಸ್ಕಾರ, IVF ಬಗ್ಗೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಏನು ಬೇಕಾದರೂ ಕೇಳಿ — ನಿಮ್ಮ ಫಲವತ್ತತೆಯ ಪ್ರಯಾಣದಲ್ಲಿ ಯಾವುದೇ ಪ್ರಶ್ನೆಯೂ ಚಿಕ್ಕದಲ್ಲ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    placeholder: 'IVF ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ...',
    send: 'ಕಳುಹಿಸಿ',
    micStart: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಮಾತನಾಡಿ',
    micStop: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ',
    speak: 'ಉತ್ತರ ಕೇಳಿ',
    stopSpeaking: 'ಮಾತು ನಿಲ್ಲಿಸಿ',
    speakToggleOn: 'ಧ್ವನಿ ಆನ್ ಆಗಿದೆ',
    speakToggleOff: 'ಧ್ವನಿ ಆಫ್ ಆಗಿದೆ',
    languageLabel: 'ಭಾಷೆ',
    emergencyTitle: 'ತುರ್ತು — ಈಗಲೇ ಸಹಾಯ ಪಡೆಯಿರಿ',
    emergencyBody:
      'ದಯವಿಟ್ಟು ಕ್ಲಿನಿಕ್ ಅನ್ನು ತಕ್ಷಣ ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ತುರ್ತು ಆರೈಕೆ ಪಡೆಯಿರಿ. ಕಾಯಬೇಡಿ — ನಿಮ್ಮ ಆರೋಗ್ಯ ಮತ್ತು ಸುರಕ್ಷತೆ ಮೊದಲು.',
    callNow: 'ಈಗಲೇ ಕರೆ ಮಾಡಿ',
    whatsAppNow: 'ವಾಟ್ಸಾಪ್',
    voiceUnsupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ',
    micPermissionDenied: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಅನುಮತಿ ನೀಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    fallbackError: 'ಈಗ ಉತ್ತರಿಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನೇರವಾಗಿ ಕ್ಲಿನಿಕ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  },
}

export const DEFAULT_LANGUAGE: Language = 'en'

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'hi' || value === 'kn'
}

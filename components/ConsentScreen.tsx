'use client'

import { Language } from '@/types'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

interface ConsentScreenProps {
  onAccept: () => void
  language: Language
  onLanguageChange: (language: Language) => void
}

export default function ConsentScreen({ onAccept, language, onLanguageChange }: ConsentScreenProps) {
  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">

        {/* Header band */}
        <div className="bg-brand-600 px-6 py-4 flex items-center gap-3">
          <img
            src="/indiraivf-logo.png"
            alt="Indira IVF"
            className="h-7 brightness-0 invert"
          />
          <div className="w-px h-5 bg-white/30" aria-hidden="true" />
          <span className="text-white/90 text-sm font-medium">Rajajinagar, Bengaluru</span>
        </div>

        <div className="p-6">
          {/* Language Selector - Prominent at top */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Select Language / ভাষা নির্বাচন করুন / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code as Language)}
                  className={`py-3 px-2 rounded-lg font-medium text-sm transition-all duration-150 border-2 ${
                    language === lang.code
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                  }`}
                  aria-label={`Select ${lang.nativeLabel}`}
                  aria-pressed={language === lang.code}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor card */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <img
                src="/dr-mekhala.webp"
                alt="Dr. Mekhala Iyengar"
                className="w-20 h-20 rounded-full object-cover object-top border-2 border-brand-100"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Dr. Mekhala Iyengar</h1>
              <p className="text-brand-600 text-sm font-medium mt-0.5">Gynaecologist & IVF Specialist</p>
              <p className="text-slate-500 text-xs mt-1">Centre Executive Director · 6+ yrs experience</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="flex items-center gap-0.5 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium border border-green-100">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  97% approval
                </span>
                <span className="text-slate-400 text-xs">· English, ಕನ್ನಡ, हिंदी</span>
              </div>
            </div>
          </div>

          {/* Credentials strip */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {['MBBS', 'MS (OB/GYN)', 'Fellowship ART', 'FOGSI', 'ISAR'].map(tag => (
              <span key={tag} className="bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full border border-brand-100 font-medium">
                {tag}
              </span>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <h2 className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">Before you continue</h2>
            <ul className="space-y-2">
              {[
                'This assistant provides general IVF information, not personalised medical advice.',
                'Do not use in emergencies — call the clinic directly or contact emergency services.',
                'Conversations are not stored or saved.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                  <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={onAccept}
            className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-150 text-sm min-h-[44px] flex items-center justify-center gap-2"
            aria-label="Accept disclaimer and start chat with Dr. Mekhala Iyengar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start Chat
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            By continuing you confirm this is an educational tool only.
          </p>
        </div>
      </div>
    </div>
  )
}

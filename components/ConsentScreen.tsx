'use client'

interface ConsentScreenProps {
  onAccept: () => void
}

export default function ConsentScreen({ onAccept }: ConsentScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">IVF Assistant</h1>
          <p className="text-slate-500 text-sm mt-1">Dr. Mekhala&apos;s Fertility Clinic</p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-amber-800 mb-2">Please read before continuing</h2>
          <ul className="space-y-2 text-sm text-amber-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              <span>This assistant provides general IVF information, not medical advice.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              <span>Do not use this assistant in emergencies. If you are experiencing a medical emergency, contact the clinic immediately or call emergency services.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              <span>Conversations are not stored or saved.</span>
            </li>
          </ul>
        </div>

        {/* Accept Button */}
        <button
          onClick={onAccept}
          className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium py-4 px-6 rounded-xl transition-colors duration-150 text-base min-h-[44px]"
          aria-label="Accept disclaimer and continue to IVF assistant"
        >
          I Understand, Continue
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          By continuing, you acknowledge that this is an educational tool only.
        </p>
      </div>
    </div>
  )
}

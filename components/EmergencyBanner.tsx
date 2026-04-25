'use client'

import { EmergencyBannerProps } from '@/types'

export default function EmergencyBanner({ clinicPhone, clinicWhatsApp }: EmergencyBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold text-base mb-1">Urgent — Please seek help now</h3>
          <p className="text-red-700 text-sm mb-3">
            Please contact the clinic immediately or seek emergency care. Do not wait — your health and safety come first.
          </p>
          <div className="flex gap-2 flex-wrap">
            <a
              href={`tel:${clinicPhone}`}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors min-h-[44px]"
              aria-label={`Call clinic urgently at ${clinicPhone}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now
            </a>
            <a
              href={`https://wa.me/${clinicWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors min-h-[44px]"
              aria-label="WhatsApp clinic urgently"
            >
              WhatsApp Now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

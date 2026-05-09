'use client'

import { ClinicCTABarProps } from '@/types'

export default function ClinicCTABar({
  clinicPhone,
  bookingUrl,
  clinicLocationUrl,
  instagramUrl,
  onCallClick,
  onBookingClick,
  onLocationClick,
  onInstagramClick,
}: ClinicCTABarProps) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap" role="group" aria-label="Contact clinic options">
      <a
        href={`tel:${clinicPhone}`}
        onClick={onCallClick}
        className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors duration-150 min-h-[44px] min-w-[44px]"
        aria-label={`Call clinic at ${clinicPhone}`}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Call Clinic
      </a>

      <a
        href={bookingUrl}
        onClick={onBookingClick}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors duration-150 min-h-[44px] min-w-[44px]"
        aria-label="Book a consultation at the clinic"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Book Consultation
      </a>

      <a
        href={clinicLocationUrl}
        onClick={onLocationClick}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium px-4 py-3 rounded-xl transition-colors duration-150 min-h-[44px] min-w-[44px]"
        aria-label="Open clinic location"
      >
        <svg className="w-4 h-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        Location
      </a>

      <a
        href={instagramUrl}
        onClick={onInstagramClick}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium px-4 py-3 rounded-xl transition-colors duration-150 min-h-[44px] min-w-[44px]"
        aria-label="Open Dr. Mekhala's Instagram"
      >
        <svg className="w-4 h-4 shrink-0 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <rect width="16" height="16" x="4" y="4" rx="4" strokeWidth={2} />
          <circle cx="12" cy="12" r="3" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M17.5 6.5h.01" />
        </svg>
        Instagram
      </a>
    </div>
  )
}

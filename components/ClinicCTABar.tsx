'use client'

import { ClinicCTABarProps } from '@/types'

export default function ClinicCTABar({
  clinicPhone,
  clinicWhatsApp,
  bookingUrl,
  clinicLocationUrl,
  instagramUrl,
  onCallClick,
  onWhatsAppClick,
  onBookingClick,
  onLocationClick,
  onInstagramClick,
}: ClinicCTABarProps) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap" role="group" aria-label="Contact clinic options">
      <a
        href={`tel:${clinicPhone}`}
        onClick={onCallClick}
        className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors duration-150 min-h-[44px] min-w-[44px]"
        aria-label={`Call clinic at ${clinicPhone}`}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Call Clinic
      </a>

      <a
        href={`https://wa.me/${clinicWhatsApp}`}
        onClick={onWhatsAppClick}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors duration-150 min-h-[44px] min-w-[44px]"
        aria-label="WhatsApp the clinic"
      >
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
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

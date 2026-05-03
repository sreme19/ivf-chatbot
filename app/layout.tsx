import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IVF Assistant — Dr. Mekhala Iyengar | Indira IVF Rajajinagar',
  description: 'Get clear, empathetic answers to your IVF questions from Dr. Mekhala Iyengar, Gynaecologist & IVF Specialist at Indira IVF Rajajinagar, Bengaluru.',
  robots: 'noindex, nofollow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

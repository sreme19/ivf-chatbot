import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "IVF Assistant — Dr. Mekhala's Clinic",
  description: 'Get clear, empathetic answers to your IVF questions. Powered by Dr. Mekhala\'s fertility clinic.',
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

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Stepzy — Snap. Solve. Understand.',
  description: 'Stepzy is your AI-powered homework helper. Snap a photo of any problem and get instant step-by-step solutions for math, science, and more.',
  keywords: [
    'AI homework helper',
    'math problem solver',
    'AI tutor',
    'step by step math',
    'homework AI',
    'photo math solver',
    'instant homework help',
    'AI study assistant',
  ],
  authors: [{ name: 'Stepzy' }],
  creator: 'Stepzy',
  metadataBase: new URL('https://stepzy-ten.vercel.app'),
  openGraph: {
    title: 'Stepzy — Snap. Solve. Understand.',
    description: 'Snap a photo of any homework problem and get instant AI-powered step-by-step solutions.',
    url: 'https://stepzy-ten.vercel.app',
    siteName: 'Stepzy',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stepzy — Snap. Solve. Understand.',
    description: 'Snap a photo of any homework problem and get instant AI-powered step-by-step solutions.',
    creator: '@stepzy',
  },
  generator: 'v0.app',
  verification: {
    google: '-F3hSYpUSZsgy2bn-LKhGHAb0vCPsJ0DkbAMuO54iPI',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
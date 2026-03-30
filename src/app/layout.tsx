import type { Metadata } from 'next'
import { Geist, Geist_Mono, Epilogue, Work_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ServiceWorkerRegister } from '@/components/shared/sw-register'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const epilogue = Epilogue({
  variable: '--font-epilogue',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
})

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'The Smile Factory | Arcade & Family Fun Center',
    template: '%s | The Smile Factory',
  },
  description:
    'Family-oriented arcade entertainment venue in Brigantine, New Jersey since 2006. Games, birthday parties, prizes, and fun for all ages!',
  keywords: [
    'arcade',
    'Brigantine',
    'New Jersey',
    'family fun',
    'birthday parties',
    'games',
    'tokens',
    'prizes',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${epilogue.variable} ${workSans.variable} font-sans antialiased`}
      >
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
          <ServiceWorkerRegister />
        </TooltipProvider>
      </body>
    </html>
  )
}

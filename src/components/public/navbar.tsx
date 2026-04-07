'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, CalendarDays } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/parties', label: 'Parties' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100 shadow-sm glass-nav">
      <nav className="relative flex w-full max-w-full items-center justify-between px-4 py-3 md:px-8 md:py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Image
            src="/branding/smile-factory-logo.png"
            alt="The Smile Factory"
            width={44}
            height={44}
            className="size-11 object-contain"
            priority
          />
        </Link>

        {/* Desktop: centered navigation */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 xl:gap-10 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-sm font-bold uppercase tracking-tight transition-all ${
                isActive(link.href)
                  ? 'border-b-2 border-primary pb-0.5 text-primary'
                  : 'text-zinc-600 hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <div className="mr-2 hidden items-center gap-4 sm:flex">
            <Link
              href="/login"
              className="font-display text-sm font-bold text-zinc-600 transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/admin/login"
              className="font-display text-sm font-bold text-zinc-600 transition-colors hover:text-primary"
            >
              Staff
            </Link>
          </div>
          <Link
            href="/parties"
            className="gradient-primary flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 active:scale-95 md:px-6 md:text-sm"
          >
            <CalendarDays className="size-4 shrink-0" />
            <span className="hidden min-[400px]:inline">Book a Party</span>
            <span className="min-[400px]:hidden">Book</span>
          </Link>

          <button
            type="button"
            className="rounded-lg p-2 text-zinc-800 transition-colors hover:bg-zinc-100 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile: slides down from under the bar */}
      <div
        className={`absolute left-0 top-full w-full border-b border-zinc-200 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 ease-out lg:hidden ${
          mobileOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-full opacity-0'
        }`}
      >
        <div className="flex flex-col gap-4 px-8 py-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`font-display text-lg font-bold uppercase tracking-tight transition-colors ${
                  isActive(link.href)
                    ? 'border-b-2 border-primary pb-0.5 font-black text-primary'
                    : 'text-zinc-600 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <hr className="border-zinc-100" />
          <div className="flex flex-col gap-4">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="font-display font-bold text-zinc-600 transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="font-display font-bold text-zinc-600 transition-colors hover:text-primary"
            >
              Staff
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

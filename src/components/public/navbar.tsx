'use client'

import { useState } from 'react'
import Link from 'next/link'
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

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/branding/smile-factory-logo.png" alt="The Smile Factory Logo" className="h-12 w-auto md:h-16" />
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex xl:gap-10">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="border-b-2 border-transparent pb-0.5 font-black uppercase tracking-tight text-zinc-600 transition-colors hover:border-red-600 hover:text-red-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="mr-2 hidden items-center gap-4 sm:flex">
            <Link href="/login" className="text-sm font-bold text-zinc-600 transition-colors hover:text-red-600">
              Sign In
            </Link>
            <Link
              href="/admin/login"
              className="text-sm font-bold text-zinc-600 transition-colors hover:text-red-600"
            >
              Staff
            </Link>
          </div>

          <Link
            href="/parties"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-red-600 to-red-700 px-4 py-2 text-xs font-black text-white shadow-md transition hover:opacity-90 md:px-6 md:text-sm"
          >
            <CalendarDays className="size-4" />
            Book a Party
          </Link>

          <button
          type="button"
          className="rounded-lg p-2 text-zinc-800 transition-colors hover:bg-zinc-100 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="absolute left-0 top-full w-full border-b border-zinc-200 bg-white px-8 py-6 shadow-xl lg:hidden">
          <ul className="space-y-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block font-black uppercase tracking-tight text-zinc-600 transition-colors hover:text-red-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex flex-col gap-3 border-t border-zinc-100 pt-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="font-bold text-zinc-600 hover:text-red-600">
                  Sign In
              </Link>
              <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="font-bold text-zinc-600 hover:text-red-600">
                Staff Portal
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

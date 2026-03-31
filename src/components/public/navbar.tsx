'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Gamepad2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE_NAME } from '@/lib/constants'

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
    <header className="sticky top-0 z-50 w-full glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex size-9 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-ambient">
            <Gamepad2 className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight font-display">{SITE_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:shadow-ambient"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="ml-3 flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Link
              href="/admin/login"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Staff
            </Link>
            <Button asChild size="sm">
              <Link href="/parties">
                Book a Party
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="bg-card shadow-elevated md:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-[var(--surface-container-low)] hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-muted-foreground text-center hover:text-foreground"
              >
                Staff
              </Link>
              <Button asChild className="w-full">
                <Link href="/parties" onClick={() => setMobileOpen(false)}>
                  Book a Party
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

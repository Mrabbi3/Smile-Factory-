import Link from 'next/link'
import { Gamepad2, MapPin, Phone, Clock, Mail } from 'lucide-react'
import { SITE_NAME, BUSINESS_INFO } from '@/lib/constants'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/pricing', label: 'Token Pricing' },
  { href: '/parties', label: 'Birthday Parties' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Sign In' },
  { href: '/register', label: 'Create Account' },
]

export function Footer() {
  return (
    <footer className="bg-[var(--surface-container-low)] pattern-industrial">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-ambient">
                <Gamepad2 className="size-5" />
              </div>
              <span className="text-lg font-bold tracking-tight font-display">{SITE_NAME}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Brigantine&apos;s favorite family arcade since {BUSINESS_INFO.established}. Over{' '}
              {BUSINESS_INFO.machineCount} games, birthday parties, and fun for all ages!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider font-display text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider font-display text-foreground">
              Hours
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Mon &ndash; Fri</p>
                  <p>{BUSINESS_INFO.hours.weekday}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Sat &ndash; Sun</p>
                  <p>{BUSINESS_INFO.hours.weekend}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider font-display text-foreground">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-4" />
                </div>
                <span>{BUSINESS_INFO.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="size-4" />
                </div>
                <a
                  href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
                  className="transition-colors duration-200 hover:text-primary"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </div>
                <a
                  href="mailto:info@thesmilefactoryarcade.com"
                  className="transition-colors duration-200 hover:text-primary"
                >
                  info@thesmilefactoryarcade.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar — no border, just tonal shift */}
        <div className="mt-12 rounded-2xl bg-card px-6 py-5 shadow-ambient flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/contact" className="transition-colors duration-200 hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/contact" className="transition-colors duration-200 hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

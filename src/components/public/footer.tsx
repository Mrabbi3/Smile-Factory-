import Link from 'next/link'
import { Gamepad2, MapPin, Phone, Clock, Mail } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
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
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Gamepad2 className="size-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Brigantine&apos;s favorite family arcade since {BUSINESS_INFO.established}. Over{' '}
              {BUSINESS_INFO.machineCount} games, birthday parties, and fun for all ages!
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Hours
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Mon &ndash; Fri</p>
                  <p>{BUSINESS_INFO.hours.weekday}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Sat &ndash; Sun</p>
                  <p>{BUSINESS_INFO.hours.weekend}</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{BUSINESS_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <a
                  href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
                  className="transition-colors hover:text-primary"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary" />
                <a
                  href="mailto:info@thesmilefactoryarcade.com"
                  className="transition-colors hover:text-primary"
                >
                  info@thesmilefactoryarcade.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/contact" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
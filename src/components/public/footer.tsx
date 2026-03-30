import Link from 'next/link'
import { MapPin, Phone, Clock, Ticket, Coins } from 'lucide-react'
import { BUSINESS_INFO } from '@/lib/constants'

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
  const factoryPattern =
    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20l20 20M0 40L20 20M20 0l20 20M0 20L20 0' stroke='%23e5e7eb' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")"

  return (
    <footer className="relative border-t border-zinc-200 bg-zinc-50 text-zinc-800">
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: factoryPattern }} />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-8 py-20 md:grid-cols-4">
        <div>
          <div className="mb-8">
            <img src="/branding/smile-factory-logo.png" alt="The Smile Factory Logo" className="h-24 w-auto" />
          </div>
          <p className="text-md leading-relaxed text-zinc-500">
            Making families smile in Brigantine since {BUSINESS_INFO.established}. Quality games, great prizes, and unforgettable memories.
          </p>
        </div>

        <div>
          <h4 className="mb-8 text-lg font-black uppercase tracking-[0.2em] text-zinc-900">Quick Links</h4>
          <ul className="space-y-4 text-zinc-500">
            {quickLinks.slice(0, 6).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex items-center gap-2 transition hover:text-red-600">
                  <span className="size-1.5 rounded-full bg-red-600" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-8 text-lg font-black uppercase tracking-[0.2em] text-zinc-900">Legal &amp; Info</h4>
          <ul className="space-y-4 text-zinc-500">
            {[{ label: 'Privacy Policy', href: '/contact' }, { label: 'Terms of Service', href: '/contact' }, { label: 'Safety Rules', href: '/contact' }, { label: 'Feedback', href: '/contact' }].map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="inline-flex items-center gap-2 transition hover:text-red-600">
                  <span className="size-1.5 rounded-full bg-red-600" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-8 text-lg font-black uppercase tracking-[0.2em] text-zinc-900">Connect</h4>
          <ul className="space-y-6 text-zinc-500">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 text-red-600" />
              <span>{BUSINESS_INFO.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 text-red-600" />
              <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`} className="transition hover:text-red-600">
                {BUSINESS_INFO.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 text-red-600" />
              <div className="flex flex-col">
                <span>Sat-Sun: {BUSINESS_INFO.hours.weekend}</span>
                <span>Mon-Fri: {BUSINESS_INFO.hours.weekday}</span>
              </div>
            </li>
            <li>
              <Link href="/admin/login" className="inline-block rounded-lg bg-red-600 px-6 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-md transition hover:opacity-90">
                Staff Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-between gap-4 border-t border-zinc-200 bg-zinc-100/50 px-8 py-8 text-center md:flex-row">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
          &copy; {new Date().getFullYear()} The Smile Factory Arcade. Built for Joy.
        </p>
        <div className="flex gap-6 text-zinc-400">
          <Ticket className="size-4" />
          <Coins className="size-4" />
          <Phone className="size-4" />
        </div>
      </div>
    </footer>
  )
}

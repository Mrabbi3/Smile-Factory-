import Link from 'next/link'
import { Gamepad2, MapPin, Phone, Clock, CreditCard, Wallet, Banknote } from 'lucide-react'
import { SITE_NAME, BUSINESS_INFO } from '@/lib/constants'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/parties', label: 'Birthday Parties' },
  { href: '/gallery', label: 'Games Gallery' },
]

const legalLinks = [
  { href: '/contact', label: 'Privacy Policy' },
  { href: '/contact', label: 'Terms of Service' },
  { href: '/contact', label: 'Safety Rules' },
  { href: '/contact', label: 'Feedback' },
]

export function Footer() {
  return (
    <footer className="w-full bg-zinc-50 text-zinc-800 relative border-t border-zinc-200">
      <div className="absolute inset-0 factory-pattern opacity-10 pointer-events-none" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 lg:px-12 py-20 max-w-7xl mx-auto relative z-10">
        {/* Brand */}
        <div>
          <Link href="/" className="mb-8 flex items-center gap-2.5 inline-flex">
            <div className="flex size-10 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-ambient">
              <Gamepad2 className="size-5" />
            </div>
            <span className="text-lg font-black tracking-tight font-display">{SITE_NAME}</span>
          </Link>
          <p className="mt-6 text-sm text-zinc-500 leading-relaxed">
            Making families smile in Brigantine since {BUSINESS_INFO.established}. Quality games, great prizes, and unforgettable memories.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-black text-lg mb-8 uppercase tracking-widest italic">
            Quick Links
          </h4>
          <ul className="space-y-4 text-zinc-500 font-medium text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-primary transition-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal & Info */}
        <div>
          <h4 className="font-display font-black text-lg mb-8 uppercase tracking-widest italic">
            Legal &amp; Info
          </h4>
          <ul className="space-y-4 text-zinc-500 font-medium text-sm">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="hover:text-primary transition-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="font-display font-black text-lg mb-8 uppercase tracking-widest italic">
            Connect
          </h4>
          <ul className="space-y-6 text-zinc-500 font-medium text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
              <span>{BUSINESS_INFO.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="size-5 text-primary shrink-0" />
              <a
                href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
                className="hover:text-primary transition-colors"
              >
                {BUSINESS_INFO.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span>Sat-Sun: {BUSINESS_INFO.hours.weekend}</span>
                <span>Mon-Fri: {BUSINESS_INFO.hours.weekday}</span>
              </div>
            </li>
            <li>
              <Link
                href="/admin/login"
                className="gradient-primary text-white px-6 py-2 rounded-lg font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all inline-block shadow-md"
              >
                Staff Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-8 lg:px-12 py-8 border-t border-zinc-200 bg-zinc-100/50 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
          © {new Date().getFullYear()} {BUSINESS_INFO.name.toUpperCase()}. BUILT FOR JOY.
        </p>
        <div className="flex gap-8 opacity-40 text-zinc-500">
          <CreditCard className="size-5" />
          <Wallet className="size-5" />
          <Banknote className="size-5" />
        </div>
      </div>
    </footer>
  )
}

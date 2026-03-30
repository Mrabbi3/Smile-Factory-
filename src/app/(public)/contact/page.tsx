import type { Metadata } from 'next'
import { Clock3, Mail, MapPin, Phone, Rocket, Settings } from 'lucide-react'
import PhotoFramePlaceholder from '../../../components/public/photo-frame-placeholder'
import { BUSINESS_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contact | The Smile Factory',
  description: 'Contact The Smile Factory — arcade party bookings, events, and general support.',
}

const blueprintPattern =
  "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 70c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 10c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' fill='%23e5e7eb' fill-opacity='0.35'/%3E%3C/svg%3E\")"

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-screen-2xl bg-surface px-6 pb-20 pt-24 text-on-surface">
      <section className="relative mb-20 mt-12 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-12 text-center shadow-ambient lg:p-24" style={{ backgroundImage: blueprintPattern }}>
        <span className="mb-8 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-work-sans text-label-sm uppercase tracking-widest text-primary">
          Assembly Line Open
        </span>
        <h1 className="font-epilogue text-display-lg font-black uppercase italic tracking-tight text-primary">Smile Factory</h1>
        <p className="mx-auto mt-6 max-w-2xl font-work-sans text-body-lg leading-relaxed text-on-surface/70">
          Need technical support for your fun? Connect with the joy engineers. We're standing by to manufacture your next celebration.
        </p>
      </section>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <section className="relative overflow-hidden rounded-lg border border-outline-variant/25 bg-surface-container-lowest p-8 shadow-ambient lg:col-span-7 md:p-12">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-ambient">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="font-epilogue text-headline-md font-black uppercase italic">Send a Signal</h2>
          </div>
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-2 font-work-sans text-label-sm uppercase tracking-wider text-on-surface/60">Operator Name</label>
                <input className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-low px-6 py-4 outline-none focus:border-primary focus:bg-surface-container-lowest" placeholder="Your Name" type="text" />
              </div>
              <div className="space-y-2">
                <label className="ml-2 font-work-sans text-label-sm uppercase tracking-wider text-on-surface/60">Digital Address</label>
                <input className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-low px-6 py-4 outline-none focus:border-primary focus:bg-surface-container-lowest" placeholder="Email" type="email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="ml-2 font-work-sans text-label-sm uppercase tracking-wider text-on-surface/60">Mission Type</label>
              <select className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-low px-6 py-4 outline-none focus:border-primary focus:bg-surface-container-lowest">
                <option>Party Inquiry</option>
                <option>Game Support</option>
                <option>Feedback & Calibration</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-2 font-work-sans text-label-sm uppercase tracking-wider text-on-surface/60">The Message</label>
              <textarea className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-low px-6 py-4 outline-none focus:border-primary focus:bg-surface-container-lowest" placeholder="How can we help manufacture your joy?" rows={5} />
            </div>
            <button className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-primary px-10 py-4 font-work-sans text-label-lg uppercase tracking-widest text-on-primary shadow-ambient md:w-auto">
              Initiate Contact
              <Rocket className="h-4 w-4" />
            </button>
          </form>
        </section>

        <section className="space-y-8 lg:col-span-5">
          <article className="rounded-lg border border-outline-variant/25 bg-surface-container-lowest p-8 shadow-ambient">
            <h2 className="mb-8 font-epilogue text-title-lg font-black uppercase italic">HQ Coordinates</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-work-sans text-label-sm uppercase tracking-wider text-on-surface/50">Physical Location</p>
                  <p className="font-work-sans text-body-md">{BUSINESS_INFO.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-work-sans text-label-sm uppercase tracking-wider text-on-surface/50">Voice Line</p>
                  <p className="font-work-sans text-body-md">{BUSINESS_INFO.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-work-sans text-label-sm uppercase tracking-wider text-on-surface/50">Operational Hours</p>
                  <p className="font-work-sans text-body-sm text-on-surface/70">Sat-Sun: {BUSINESS_INFO.hours.weekend}</p>
                  <p className="font-work-sans text-body-sm text-on-surface/70">Mon-Fri: {BUSINESS_INFO.hours.weekday}</p>
                </div>
              </div>
            </div>
          </article>
          <article className="group relative h-[300px] overflow-hidden rounded-lg border border-outline-variant/25 bg-surface-container-high shadow-ambient">
            <PhotoFramePlaceholder title="Location Photo Frame" note="Replace with storefront or location photo" />
            <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-outline-variant/20 bg-surface-container-lowest/95 p-4 backdrop-blur-glass">
              <p className="font-work-sans text-label-sm uppercase tracking-widest text-on-surface">Brigantine HQ</p>
            </div>
          </article>
        </section>
      </div>

      <section className="mt-20 flex flex-wrap justify-center gap-4">
        {['High-Tech Calibration', 'Precision Fun', 'Joy Engineered'].map((chip) => (
          <div key={chip} className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-container-lowest px-6 py-3 shadow-ambient">
            <Settings className="h-4 w-4 text-primary transition-transform duration-700 group-hover:rotate-180" />
            <span className="font-work-sans text-label-lg uppercase tracking-tight">{chip}</span>
          </div>
        ))}
      </section>

      <section className="mt-16 flex justify-center">
        <a href={`mailto:hello@smilefactoryarcade.com`} className="inline-flex items-center gap-2 rounded-lg bg-secondary-container px-6 py-3 font-work-sans text-label-lg uppercase text-on-secondary-container">
          <Mail className="h-4 w-4" />
          Email Team
        </a>
      </section>
    </main>
  )
}

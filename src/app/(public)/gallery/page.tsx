import type { Metadata } from 'next'
import { Heart, RefreshCcw, Star, Ticket, Trophy } from 'lucide-react'
import PhotoFramePlaceholder from '../../../components/public/photo-frame-placeholder'

export const metadata: Metadata = {
  title: 'Gallery | The Smile Factory',
  description:
    'Explore The Smile Factory arcade gallery — arcade action, birthday smiles, prize winners, and the factory floor.',
}

const blueprintPattern =
  "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 70c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 10c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' fill='%23e5e7eb' fill-opacity='0.35'/%3E%3C/svg%3E\")"

const winners = [
  { initials: 'LF', prize: 'Leo F. - Mega Prize', detail: 'Won a Nintendo Switch', tone: 'bg-primary' },
  { initials: 'SK', prize: 'Sarah K. - Ticket King', detail: '150,000 Tickets in one session', tone: 'bg-secondary' },
  { initials: 'MJ', prize: 'Marcus J. - High Score', detail: 'Pac-Man Global Rank #4', tone: 'bg-on-surface' },
] as const

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-surface pb-20 pt-24 text-on-surface" style={{ backgroundImage: blueprintPattern }}>
      <section className="mx-auto max-w-screen-2xl overflow-hidden px-8 py-20">
        <div className="flex flex-col items-center gap-12 md:flex-row">
          <div className="flex-1 space-y-6">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-work-sans text-label-sm uppercase tracking-widest text-primary">
              Visual Archive
            </span>
            <h1 className="font-epilogue text-display-lg font-black uppercase italic leading-[0.9] tracking-tight">
              The <span className="text-primary">Smile</span>
              <br />
              Factory
            </h1>
            <p className="max-w-xl font-work-sans text-body-lg leading-relaxed text-on-surface/70">
              Step into the assembly line of joy. From high-score heroics to neon-drenched birthday celebrations, witness the factory in full production mode.
            </p>
          </div>
          <div className="group relative aspect-video w-full flex-1 overflow-hidden rounded-lg border-[6px] border-on-surface bg-surface-container-high shadow-ambient">
            <PhotoFramePlaceholder title="Gallery Hero Photo" note="Replace with arcade floor hero photo" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl space-y-24 px-8 py-16">
        <div className="space-y-8">
          <div className="flex items-end justify-between border-b-2 border-primary/10 pb-4">
            <h2 className="font-epilogue text-headline-lg font-black uppercase italic tracking-tight">Arcade Action</h2>
            <span className="font-epilogue text-6xl font-black tracking-tighter text-primary/15">01</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="col-span-1 aspect-[16/9] overflow-hidden rounded-lg border-[6px] border-on-surface bg-surface-container-high shadow-ambient md:col-span-2"><PhotoFramePlaceholder title="Arcade Action 1" note="Replace with gameplay photo" /></div>
            <div className="aspect-square overflow-hidden rounded-lg border-[6px] border-on-surface bg-surface-container-high shadow-ambient"><PhotoFramePlaceholder title="Arcade Action 2" note="Replace with machine photo" /></div>
            <div className="aspect-square overflow-hidden rounded-lg border-[6px] border-on-surface bg-surface-container-high shadow-ambient"><PhotoFramePlaceholder title="Arcade Action 3" note="Replace with racing game photo" /></div>
            <div className="col-span-1 aspect-[21/9] overflow-hidden rounded-lg border-[6px] border-on-surface bg-surface-container-high shadow-ambient md:col-span-2"><PhotoFramePlaceholder title="Arcade Action 4" note="Replace with wide floor photo" /></div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-end justify-between border-b-2 border-primary/10 pb-4">
            <h2 className="font-epilogue text-headline-lg font-black uppercase italic tracking-tight">Birthday Smiles</h2>
            <span className="font-epilogue text-6xl font-black tracking-tighter text-primary/15">02</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg border-[6px] border-on-surface bg-surface-container-high shadow-ambient">
                <PhotoFramePlaceholder title={`Birthday Photo ${i + 1}`} note="Replace with real party photo" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-end justify-between border-b-2 border-primary/10 pb-4">
            <h2 className="font-epilogue text-headline-lg font-black uppercase italic tracking-tight">Prize Winners</h2>
            <span className="font-epilogue text-6xl font-black tracking-tighter text-primary/15">03</span>
          </div>
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-1 rounded-lg border-l-8 border-primary bg-surface-container-lowest p-8 shadow-ambient">
              <div className="mb-6 flex items-center gap-4">
                <Star className="h-10 w-10 text-primary" />
                <h3 className="font-epilogue text-title-lg font-black uppercase italic tracking-tight">Jackpot Junction</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square overflow-hidden rounded-lg border-[6px] border-on-surface bg-surface-container-high shadow-ambient"><PhotoFramePlaceholder title="Prize Wall" note="Replace with prize counter photo" /></div>
                <div className="aspect-square overflow-hidden rounded-lg border-[6px] border-on-surface bg-surface-container-high shadow-ambient"><PhotoFramePlaceholder title="Winner Photo" note="Replace with winner moment photo" /></div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {winners.map((w) => (
                <div key={w.initials} className="group flex items-center justify-between rounded-lg border border-outline-variant/25 bg-surface-container-high p-6 transition-colors hover:bg-surface-container-lowest">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full font-epilogue font-black text-on-primary ${w.tone}`}>
                      {w.initials}
                    </div>
                    <div>
                      <p className="font-work-sans text-label-lg text-on-surface">{w.prize}</p>
                      <p className="font-work-sans text-body-sm text-on-surface/60">{w.detail}</p>
                    </div>
                  </div>
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="font-epilogue text-headline-lg font-black uppercase italic tracking-tight">Join the Factory Floor</h2>
            <p className="font-work-sans text-body-md text-on-surface/70">
              Tag your wins with <span className="font-bold text-primary">#SMILEFACTORYARCADE</span> for a chance to be featured.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border-4 border-black bg-on-surface shadow-ambient">
                <PhotoFramePlaceholder title={`Social Photo ${i + 1}`} note="Replace with customer photo" className="bg-zinc-900" titleClassName="text-white" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Heart className="h-8 w-8 text-on-primary" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button className="flex items-center gap-2 rounded-full bg-on-surface px-10 py-4 font-work-sans text-label-lg uppercase text-on-primary shadow-ambient transition-colors hover:bg-primary">
              Load More Action
              <RefreshCcw className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-4 py-2 font-work-sans text-label-sm text-tertiary">
              <Ticket className="h-4 w-4" />
              Prize Gear Active
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}

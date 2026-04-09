import type { Metadata } from 'next'
import Image from 'next/image'
import { Gamepad2, Heart, Star, Trophy, Settings } from 'lucide-react'
import { BUSINESS_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Gallery | The Smile Factory',
  description:
    'Explore The Smile Factory arcade gallery — arcade action, birthday smiles, prize winners, and the factory floor.',
}

const arcadePhotos = [
  {
    label: 'Arcade Controls',
    span: 'col-span-1 md:col-span-2 aspect-[16/9]',
    src: '/gallery-photos/gallery3.jpg',
    alt: 'Arcade controls at The Smile Factory',
  },
  {
    label: 'Gamer Portrait',
    span: 'aspect-square',
    src: '/gallery-photos/gallery4.jpg',
    alt: 'Gamer portrait at The Smile Factory',
  },
  {
    label: 'Racing Games',
    span: 'aspect-square',
    src: '/gallery-photos/gallery2.jpg',
    alt: 'Racing games at The Smile Factory',
  },
  {
    label: 'Motion Blur Lights',
    span: 'col-span-1 md:col-span-2 aspect-[21/9]',
    src: '/gallery-photos/gallery6.jpg',
    alt: 'Motion blur lights in the arcade',
  },
]

const birthdayPhotos = [
  {
    label: 'Kids Celebrating',
    src: '/gallery-photos/birthday1.jpg',
    alt: 'Kids celebrating at The Smile Factory',
  },
  {
    label: 'Birthday Cake',
    src: '/gallery-photos/birthday2.jpg',
    alt: 'Birthday cake at The Smile Factory',
  },
  {
    label: 'Friends Playing',
    src: '/gallery-photos/birthday3.jpg',
    alt: 'Friends playing games at The Smile Factory',
  },
  {
    label: 'Party Atmosphere',
    src: '/gallery-photos/birthday4.jpg',
    alt: 'Birthday party atmosphere at The Smile Factory',
  },
]

const prizeWinners = [
  { initials: 'LF', name: 'Leo F. - Mega Prize', desc: 'Won a Nintendo Switch', color: 'bg-primary' },
  { initials: 'SK', name: 'Sarah K. - Ticket King', desc: '150,000 Tickets in one session', color: 'bg-[var(--secondary)]' },
  { initials: 'MJ', name: 'Marcus J. - High Score', desc: 'Pac-Man Global Rank #4', color: 'bg-zinc-900' },
]

const socialFeed = [
  {
    label: 'Tokens in Hand',
    src: '/gallery-photos/tag1.jpg',
    alt: 'Tokens in hand',
  },
  {
    label: 'Game Graphics',
    src: '/gallery-photos/tag2.jpg',
    alt: 'Game graphics',
  },
  {
    label: 'Arcade Floor',
    src: '/gallery-photos/tag3.jpg',
    alt: 'Arcade floor',
  },
  {
    label: 'Red Button',
    src: '/gallery-photos/tag4.jpg',
    alt: 'Red arcade button',
  },
  {
    label: 'Prize Machine',
    src: '/gallery-photos/tag5.jpg',
    alt: 'Prize machine',
  },
  {
    label: 'Tickets Dispenser',
    src: '/gallery-photos/tag6.jpg',
    alt: 'Tickets dispenser',
  },
  {
    label: 'Classic Controller',
    src: '/gallery-photos/tag7.jpg',
    alt: 'Classic controller',
  },
  {
    label: 'Neon Sign',
    src: '/gallery-photos/tag8.jpg',
    alt: 'Neon sign',
  },
]

const prizeGalleryPhotos = [
  {
    label: 'Prize Wall',
    src: '/gallery-photos/jackpot1.jpg',
    alt: 'Prize wall at The Smile Factory',
  },
  {
    label: 'Happy Winner',
    src: '/gallery-photos/jackpot2.jpg',
    alt: 'Happy winner at The Smile Factory',
  },
]

export default function GalleryPage() {
  return (
    <main className="pt-24 min-h-screen blueprint-gears">
      {/* Hero */}
      <section className="relative px-8 py-20 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-black tracking-widest uppercase rounded-full border border-primary/20 font-display">
              Visual Archive
            </span>
            <h1 className="text-6xl md:text-8xl font-black font-display leading-[0.9] tracking-tighter italic uppercase">
              THE <span className="text-primary">SMILE</span>
              <br />
              FACTORY
            </h1>
            <p className="text-xl text-zinc-500 max-w-xl leading-relaxed">
              Step into the assembly line of joy. From the high-score heroics to the
              neon-drenched birthday celebrations, witness the factory in full production mode.
            </p>
          </div>

          <div className="flex-1 w-full aspect-video rounded-2xl overflow-hidden bg-zinc-200 shadow-2xl relative group border-4 border-zinc-900">
            <Image
              src="/gallery-photos/gallery1.jpg"
              alt="Arcade atmosphere at The Smile Factory"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Gallery Sections */}
      <section className="px-8 py-16 max-w-7xl mx-auto space-y-32">
        {/* Arcade Action */}
        <div className="space-y-8">
          <div className="flex items-end justify-between border-b-2 border-primary/10 pb-4">
            <h2 className="text-4xl font-black font-display tracking-tight uppercase italic">
              Arcade Action
            </h2>
            <span className="text-primary font-black tracking-tighter text-6xl opacity-10 font-display">
              01
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {arcadePhotos.map((photo) => (
              <div
                key={photo.label}
                className={`${photo.span} rounded-2xl overflow-hidden border-[6px] border-zinc-900 shadow-xl group bg-zinc-100 min-h-[200px] relative`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Birthday Smiles */}
        <div className="space-y-8">
          <div className="flex items-end justify-between border-b-2 border-primary/10 pb-4">
            <h2 className="text-4xl font-black font-display tracking-tight uppercase italic">
              Birthday Smiles
            </h2>
            <span className="text-primary font-black tracking-tighter text-6xl opacity-10 font-display">
              02
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {birthdayPhotos.map((photo) => (
              <div
                key={photo.label}
                className="aspect-[3/4] rounded-2xl overflow-hidden border-[6px] border-zinc-900 shadow-xl group bg-zinc-100 relative"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prize Winners */}
        <div className="space-y-8">
          <div className="flex items-end justify-between border-b-2 border-primary/10 pb-4">
            <h2 className="text-4xl font-black font-display tracking-tight uppercase italic">
              Prize Winners
            </h2>
            <span className="text-primary font-black tracking-tighter text-6xl opacity-10 font-display">
              03
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border-l-8 border-primary">
              <div className="flex items-center gap-4 mb-6">
                <Star className="size-8 text-primary fill-primary" />
                <h3 className="text-2xl font-black font-display tracking-tighter italic">
                  JACKPOT JUNCTION
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {prizeGalleryPhotos.map((photo) => (
                  <div
                    key={photo.label}
                    className="aspect-square rounded-2xl overflow-hidden border-[6px] border-zinc-900 shadow-xl bg-zinc-100 relative"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {prizeWinners.map((winner) => (
                <div
                  key={winner.initials}
                  className="bg-zinc-100 rounded-2xl p-6 flex items-center justify-between group hover:bg-white transition-colors border border-zinc-100"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${winner.color} flex items-center justify-center text-white font-black font-display`}
                    >
                      {winner.initials}
                    </div>
                    <div>
                      <p className="font-bold">{winner.name}</p>
                      <p className="text-sm opacity-60">{winner.desc}</p>
                    </div>
                  </div>
                  <Trophy className="size-5 text-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Feed */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black font-display tracking-tighter uppercase italic">
              Join the Factory Floor
            </h2>
            <p className="text-zinc-500 font-medium">
              Tag your wins with{' '}
              <span className="text-primary font-black">#SMILEFACTORYARCADE</span>{' '}
              for a chance to be featured.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {socialFeed.map((photo) => (
              <div
                key={photo.label}
                className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border-4 border-black shadow-lg group relative"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="size-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

import type { Metadata } from 'next'
import { Camera, Gamepad2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BUSINESS_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Gallery',
  description: `Take a look inside The Smile Factory arcade! Browse photos of our ${BUSINESS_INFO.machineCount}+ arcade games, party room, prize counter, and more.`,
}

const placeholders = [
  { label: 'Arcade Floor', span: 'sm:col-span-2 sm:row-span-2' },
  { label: 'Classic Games', span: '' },
  { label: 'Prize Counter', span: '' },
  { label: 'Party Room', span: 'sm:col-span-2' },
  { label: 'Racing Games', span: '' },
  { label: 'Claw Machines', span: '' },
  { label: 'Skee-Ball Alley', span: '' },
  { label: 'Birthday Fun', span: '' },
  { label: 'Ticket Redemption', span: 'sm:col-span-2' },
  { label: 'Family Moments', span: '' },
  { label: 'Air Hockey', span: '' },
]

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-sm">
              <Camera className="size-3.5 text-primary" />
              Take a Look Inside
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Gallery
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A peek inside The Smile Factory — {BUSINESS_INFO.machineCount}+ games, a prize
              counter full of goodies, and a party room ready for celebrations!
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {placeholders.map((item) => (
              <div
                key={item.label}
                className={`group relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-muted to-muted/50 transition-all hover:shadow-lg ${item.span}`}
              >
                <div className="flex flex-col items-center gap-3 text-muted-foreground transition-colors group-hover:text-primary">
                  <Gamepad2 className="size-10 opacity-30 transition-opacity group-hover:opacity-60" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/5" />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Photos coming soon! Visit us to see the fun in person.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

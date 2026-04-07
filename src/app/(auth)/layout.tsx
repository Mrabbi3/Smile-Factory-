import Link from 'next/link'
import { Smile, ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[var(--surface-container-low)] pattern-industrial px-4 py-12">
      <div className="mb-10 flex flex-col items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full gradient-primary p-3.5 text-white hover:opacity-90 transition-all duration-200 shadow-elevated hover:scale-105"
        >
          <Smile className="size-7" />
        </Link>
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            The Smile Factory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Arcade &amp; Family Fun Center
          </p>
        </div>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-3" />
        Back to homepage
      </Link>
    </div>
  )
}

import Link from 'next/link'
import { Smile, ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Smile className="size-10" />
          <span className="text-2xl font-bold tracking-tight">
            The Smile Factory
          </span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Arcade &amp; Family Fun Center
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-3" />
        Back to homepage
      </Link>
    </div>
  )
}

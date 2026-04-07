import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[var(--surface-container-low)] pattern-industrial px-4 py-12">
      <div className="mb-10 flex flex-col items-center gap-4">
        <Link href="/" className="transition-transform duration-200 hover:scale-105">
          <Image
            src="/branding/smile-factory-logo.png"
            alt="The Smile Factory"
            width={320}
            height={128}
            className="h-auto w-full max-w-[320px] object-contain"
            priority
          />
        </Link>
        <div className="text-center">
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

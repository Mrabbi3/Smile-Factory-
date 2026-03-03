import { Smile } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Smile className="size-10" />
          <span className="text-2xl font-bold tracking-tight">
            The Smile Factory
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Arcade &amp; Family Fun Center
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
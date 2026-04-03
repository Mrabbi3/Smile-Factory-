import Image from 'next/image'

type StitchScreenEmbedProps = {
  title: string
  routeKey: string
}

export function StitchScreenEmbed({ title, routeKey }: StitchScreenEmbedProps) {
  const htmlPath = `/stitch/admin/${routeKey}/code.html`
  const screenshotPath = `/stitch/admin/${routeKey}/screen.png`

  return (
    <div className="-m-6 space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <a
          href={htmlPath}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Open Full Screen
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <iframe
          title={title}
          src={htmlPath}
          className="h-[calc(100vh-13rem)] min-h-[720px] w-full"
        />
      </div>

      <details className="rounded-xl border border-border bg-card p-3">
        <summary className="cursor-pointer text-sm font-medium">Reference Screenshot</summary>
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <Image
            src={screenshotPath}
            alt={`${title} reference`}
            width={1920}
            height={1080}
            className="h-auto w-full"
          />
        </div>
      </details>
    </div>
  )
}

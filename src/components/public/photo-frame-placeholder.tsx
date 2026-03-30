type PhotoFramePlaceholderProps = {
  title: string
  note?: string
  className?: string
  titleClassName?: string
}

export default function PhotoFramePlaceholder({
  title,
  note = 'Replace with arcade photography',
  className = '',
  titleClassName = '',
}: PhotoFramePlaceholderProps) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-100 px-6 text-center ${className}`}>
      <div className="size-12 rounded-full border-2 border-dashed border-red-300 bg-white" />
      <p className={`text-sm font-black uppercase tracking-[0.2em] text-zinc-800 ${titleClassName}`}>{title}</p>
      <p className="text-sm text-zinc-500">{note}</p>
    </div>
  )
}
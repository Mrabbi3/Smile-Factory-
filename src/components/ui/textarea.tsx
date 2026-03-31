import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground focus-visible:ring-primary/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2 flex field-sizing-content min-h-16 w-full rounded-xl border-0 bg-[var(--surface-container-highest)] px-4 py-3 text-base shadow-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:bg-card focus-visible:shadow-ambient disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

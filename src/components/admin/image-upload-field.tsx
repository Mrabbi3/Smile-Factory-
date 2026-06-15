'use client'

import { useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadMediaImage } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type ImageUploadFieldProps = {
  /** Storage subfolder, e.g. 'prizes' or 'machines'. */
  folder: string
  /** Stable id for the entity (used in the filename). */
  entityId: string
  /** Current image URL (controlled). */
  value: string | null
  /** Called with the new public URL, or null when removed. */
  onChange: (url: string | null) => void
  disabled?: boolean
  label?: string
}

export function ImageUploadField({
  folder,
  entityId,
  value,
  onChange,
  disabled,
  label = 'Picture',
}: ImageUploadFieldProps) {
  const supabase = useMemo(() => createClient(), [])
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadMediaImage(supabase, folder, entityId, file)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      onChange(result.url)
      toast.success('Image uploaded')
    } catch (err) {
      console.error('Image upload error:', err)
      toast.error('Could not upload image')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-400',
            value && 'border-solid'
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-6" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : value ? (
              'Replace'
            ) : (
              'Upload image'
            )}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={disabled || uploading}
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  )
}

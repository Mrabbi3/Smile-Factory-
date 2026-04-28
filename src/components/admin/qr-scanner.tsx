'use client'

import { useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  onDecode: (text: string) => void
  label?: string
}

export function QrScannerButton({ onDecode, label = 'Scan QR' }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const ctrlsRef = useRef<{ stop: () => void } | null>(null)
  const [open, setOpen] = useState(false)

  const teardown = async () => {
    try {
      ctrlsRef.current?.stop()
    } catch {
      /* ignore */
    }
    ctrlsRef.current = null
    const v = videoRef.current
    if (v?.srcObject) {
      ;(v.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
      v.srcObject = null
    }
    setOpen(false)
  }

  const start = async () => {
    setOpen(true)
    await new Promise((r) => requestAnimationFrame(r))
    if (!videoRef.current) return
    const reader = new BrowserMultiFormatReader()
    try {
      ctrlsRef.current = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            onDecode(result.getText())
            toast.success('Code captured')
            void teardown()
          }
        }
      )
    } catch {
      toast.error('Camera unavailable. Paste the QR text into the staff field.')
      void teardown()
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl font-black tracking-tight"
        onClick={() => {
          void start()
        }}
      >
        <Camera className="mr-2 size-4" />
        {label}
      </Button>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-6 bg-black/90 p-4"
          onClick={() => void teardown()}
        >
          <video
            ref={videoRef}
            className="max-h-[70vh] max-w-lg rounded-xl bg-black"
            muted
            playsInline
          />
          <span className="text-sm font-semibold text-white/90">
            Align the QR in frame · tap backdrop to cancel
          </span>
        </button>
      )}
    </>
  )
}

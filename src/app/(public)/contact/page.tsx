'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  MapPin, Phone, Clock, Mail, Send, ArrowRight, Loader2,
  Settings, Rocket, Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { BUSINESS_INFO } from '@/lib/constants'
import { submitContactForm } from './actions'

const blueprintPattern =
  "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 70c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 10c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' fill='%23e5e7eb' fill-opacity='0.35'/%3E%3C/svg%3E\")"

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setSubmitted(true)
      toast.success('Message sent successfully!')
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <>
      {/* Hero */}
      <section className="mt-24 mb-20 relative overflow-hidden rounded-xl bg-white blueprint-gears p-12 lg:p-24 flex flex-col items-center text-center border border-gray-100 shadow-sm mx-6 max-w-7xl lg:mx-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl" />
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-widest mb-8 border border-primary/20 font-display relative z-10">
          Assembly Line Open
        </span>
        <h1 className="text-5xl md:text-8xl font-black industrial-text font-display tracking-tighter mb-6 uppercase italic relative z-10">
          Contact Us
        </h1>
        <p className="max-w-2xl text-xl text-zinc-600 leading-relaxed relative z-10">
          Need technical support for your fun? Connect with the joy engineers. We&apos;re standing by to manufacture your next celebration.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start px-6 max-w-7xl mx-auto pb-20">
        {/* Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
            <Settings className="size-36" />
          </div>
          <div className="mb-10 flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <Radio className="size-5" />
            </div>
            <h2 className="text-3xl font-black font-display tracking-tight uppercase italic">
              Send a Signal
            </h2>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-5 py-16 text-center relative z-10">
              <div className="flex size-20 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-ambient">
                <Send className="size-8" />
              </div>
              <h3 className="font-display text-2xl font-bold">Message Sent!</h3>
              <p className="max-w-sm text-zinc-500">
                Thank you for reaching out! We&apos;ll get back to you as soon as possible.
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form action={formAction} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-2">
                    Operator Name
                  </Label>
                  <Input
                    name="name"
                    placeholder="Your Name"
                    required
                    className="px-6 py-4 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-2">
                    Digital Address
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="px-6 py-4 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-2">
                  Mission Type
                </Label>
                <Input
                  name="subject"
                  placeholder="Party Inquiry / Game Support / Feedback"
                  className="px-6 py-4 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-2">
                  The Message
                </Label>
                <Textarea
                  name="message"
                  placeholder="How can we help manufacture your joy?"
                  rows={5}
                  required
                  className="px-6 py-4 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto px-10 py-5 rounded-full gradient-primary text-primary-foreground font-black uppercase tracking-widest border-0 shadow-lg hover:opacity-90"
                disabled={isPending}
              >
                {isPending ? (
                  <><Loader2 className="size-4 animate-spin mr-2" /> Sending...</>
                ) : (
                  <>Initiate Contact <Rocket className="size-4 ml-2" /></>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* HQ Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black font-display tracking-tight mb-8 uppercase italic">
              HQ Coordinates
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Physical Location</p>
                  <p className="text-zinc-800 leading-tight font-medium">{BUSINESS_INFO.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Phone className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Voice Line</p>
                  <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`} className="text-zinc-800 font-medium hover:text-primary transition-colors">
                    {BUSINESS_INFO.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Operational Hours</p>
                  <div className="text-sm text-zinc-600 font-medium space-y-1">
                    <div className="flex justify-between w-full max-w-[200px]">
                      <span>Sat - Sun:</span> <span>{BUSINESS_INFO.hours.weekend}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-[200px]">
                      <span>Mon - Fri:</span> <span>{BUSINESS_INFO.hours.weekday}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="rounded-2xl overflow-hidden h-[300px] relative shadow-sm border border-gray-100 bg-zinc-100 flex items-center justify-center group">
            <div className="text-center text-zinc-400">
              <MapPin className="size-12 mx-auto mb-3 opacity-30" />
              <p className="font-display font-bold text-sm">Map Coming Soon</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS_INFO.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline font-bold"
              >
                Open Maps <ArrowRight className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Gear Chips */}
      <div className="pb-20 flex flex-wrap gap-4 justify-center px-6">
        {[
          { icon: Settings, label: 'High-Tech Calibration' },
          { icon: Settings, label: 'Precision Fun' },
          { icon: Settings, label: 'Joy Engineered' },
        ].map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-primary/20 shadow-sm group cursor-default"
          >
            <chip.icon className="size-5 text-primary group-hover:rotate-180 transition-transform duration-1000" />
            <span className="text-zinc-800 font-bold text-sm uppercase tracking-tight">{chip.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

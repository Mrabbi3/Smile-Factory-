'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { MapPin, Phone, Clock, Mail, Send, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BUSINESS_INFO } from '@/lib/constants'
import { submitContactForm } from './actions'

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setSubmitted(true)
      toast.success('Message sent! Check your email for a confirmation.')
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-sm">
              <Mail className="size-3.5 text-primary" />
              Get in Touch
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Have a question, want to book a party, or just want to say hi? We&apos;d love to
              hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Contact Info */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Visit Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{BUSINESS_INFO.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {BUSINESS_INFO.phone}
                      </a>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium">Hours</p>
                      <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">Mon &ndash; Fri:</span>{' '}
                          {BUSINESS_INFO.hours.weekday}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Sat &ndash; Sun:</span>{' '}
                          {BUSINESS_INFO.hours.weekend}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:info@thesmilefactoryarcade.com"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        info@thesmilefactoryarcade.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="overflow-hidden">
                <div className="flex h-56 items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="mx-auto mb-2 size-8 opacity-40" />
                    <p className="text-sm font-medium">Map Coming Soon</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS_INFO.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Open in Google Maps
                      <ChevronRight className="size-3" />
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="flex flex-col items-center gap-4 py-12 text-center">
                      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Send className="size-7" />
                      </div>
                      <h3 className="text-xl font-semibold">Message Sent!</h3>
                      <p className="max-w-sm text-muted-foreground">
                        Thank you for reaching out! We&apos;ll get back to you as soon as
                        possible.
                      </p>
                      <Button variant="outline" onClick={() => setSubmitted(false)}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form action={formAction} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="What's this about?"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us how we can help..."
                          rows={6}
                          required
                        />
                      </div>
                      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                        {isPending ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick CTA */}
      <section className="bg-muted/40 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Prefer to call?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Give us a ring and we&apos;ll be happy to help!
          </p>
          <Button asChild size="lg" className="mt-6">
            <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
              <Phone className="size-4" />
              Call {BUSINESS_INFO.phone}
            </a>
          </Button>
        </div>
      </section>
    </>
  )
}

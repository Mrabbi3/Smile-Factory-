import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reviews | The Smile Factory',
  description: 'Guest reviews and testimonials for The Smile Factory arcade in Brigantine, NJ.',
}

export default function ReviewsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-4xl font-black font-display">Reviews</h1>
      <p className="text-muted-foreground">
        Aggregate list is powered from the home page review section.{' '}
        <Link href="/" className="text-primary font-semibold underline">Back to home</Link>
      </p>
    </div>
  )
}

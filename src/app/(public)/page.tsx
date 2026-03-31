import type { Metadata } from 'next'
import HomePageContent from '@/components/public/home-page-content'

export const metadata: Metadata = {
  title: 'Home | The Smile Factory',
  description:
    "Welcome to The Smile Factory - Brigantine's favorite family arcade since 2006. Over 41 games, birthday parties, prizes, and fun for all ages!",
}

export default function HomePage() {
  return <HomePageContent />
}

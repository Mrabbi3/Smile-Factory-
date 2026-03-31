import type { Metadata } from 'next'
import PricingPageContent from '@/components/public/pricing-page-content'

export const metadata: Metadata = {
  title: 'Pricing | The Smile Factory',
  description: 'Fuel your fun with premium token bundles and industrial-grade value tiers.',
}

export default function PricingPage() {
  return <PricingPageContent />
}

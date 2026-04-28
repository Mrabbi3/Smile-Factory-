import { Navbar } from '@/components/public/navbar'
import { Footer } from '@/components/public/footer'
import { AlertMarquee } from '@/components/public/alert-marquee'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AlertMarquee />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

import { Navbar } from '@/components/public/navbar'
import { Footer } from '@/components/public/footer'
import { Chatbot } from '@/components/shared/chatbot'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  )
}

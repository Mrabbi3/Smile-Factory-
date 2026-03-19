import { WifiOff, Phone, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Offline',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 text-center space-y-4">
          <WifiOff className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection. 
            Some features may be unavailable.
          </p>
          <div className="pt-4 space-y-3 text-sm text-left">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <span>(609) 266-3866</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <span>1307 W Brigantine Ave # B, Brigantine, NJ 08203</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            The page will automatically reconnect when your internet is restored.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

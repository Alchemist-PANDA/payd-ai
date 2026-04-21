import './globals.css'
import './typography.css'
import './animations.css'
import { ToastProvider } from '../components/ui/Toast'

export const metadata = {
  title: 'PayD AI — Intelligent Invoice Reminders',
  description: 'Your clients owe you money. PayD AI makes sure they pay it.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

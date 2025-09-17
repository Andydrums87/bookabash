// app/preview/layout.js 
import { ToastProvider } from '@/components/ui/toast'
import { Analytics } from "@vercel/analytics/next"

export default function PreviewLayout({ children }) {
  return (
    <ToastProvider>
      {children}
      <Analytics />
    </ToastProvider>
  )
}
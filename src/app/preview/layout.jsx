// app/preview/layout.js 
import { ToastProvider } from '@/components/ui/toast'

export default function PreviewLayout({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
// components/ui/toast.jsx - The Toast Component
"use client"

import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

// Toast Context
const ToastContext = createContext()

// Toast types and their configurations
const toastTypes = {
  success: {
    icon: CheckCircle,
    bgGradient: 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]',
    borderColor: 'border-[hsl(var(--primary-300))]',
    iconBg: 'bg-[hsl(var(--primary-50))]',
    iconColor: 'text-[hsl(var(--primary-700))]',
    textColor: 'text-white',
    shadowColor: 'shadow-[hsl(var(--primary-500))]/25'
  },
  error: {
    icon: AlertCircle,
    bgGradient: 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]',
    borderColor: 'border-[hsl(var(--primary-300))]',
    iconBg: 'bg-[hsl(var(--primary-50))]',
    iconColor: 'text-[hsl(var(--primary-700))]',
    textColor: 'text-white',
    shadowColor: 'shadow-[hsl(var(--primary-500))]/25'
  },
  warning: {
    icon: AlertTriangle,
    bgGradient: 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]',
    borderColor: 'border-[hsl(var(--primary-300))]',
    iconBg: 'bg-[hsl(var(--primary-50))]',
    iconColor: 'text-[hsl(var(--primary-700))]',
    textColor: 'text-white',
    shadowColor: 'shadow-[hsl(var(--primary-500))]/25'
  },
  info: {
    icon: Info,
    bgGradient: 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]',
    borderColor: 'border-[hsl(var(--primary-300))]',
    iconBg: 'bg-[hsl(var(--primary-50))]',
    iconColor: 'text-[hsl(var(--primary-700))]',
    textColor: 'text-white',
    shadowColor: 'shadow-[hsl(var(--primary-500))]/25'
  }
}

// Individual Toast Component
function Toast({ toast, onRemove }) {
  const config = toastTypes[toast.type] || toastTypes.info
  const Icon = config.icon

  return (
    <div className={`
      ${config.bgGradient} ${config.textColor}
      p-1 rounded-2xl shadow-xl ${config.shadowColor} border border-white/20
      animate-in slide-in-from-right-full duration-500 ease-out
      hover:shadow-2xl hover:scale-[1.02] transition-all duration-200
      backdrop-blur-sm max-w-sm min-w-[320px]
    `}>
      {/* Inner content with white background */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 flex items-start gap-3">
        {/* Icon with colored background */}
        <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0 border border-${config.borderColor}`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-bold text-gray-900 text-sm mb-1 leading-tight">
              {toast.title}
            </h4>
          )}
          <p className={`text-sm text-gray-700 leading-relaxed ${toast.title ? '' : 'font-medium'}`}>
            {toast.message}
          </p>
        </div>
        
        {/* Close button */}
        <button 
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {toast.duration && (
        <div className="h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white/60 animate-pulse"
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null

  return (
    <>
      <style jsx global>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: calc(100vh - 2rem);
          overflow: hidden;
        }
        
        @media (max-width: 640px) {
          .toast-container {
            left: 1rem;
            right: 1rem;
            top: 1rem;
          }
        }
      `}</style>
      
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onRemove={removeToast}
          />
        ))}
      </div>
    </>
  )
}

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'info',
      duration: 4000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Toast helper functions
  const toast = {
    success: (message, options = {}) => addToast({ ...options, message, type: 'success' }),
    error: (message, options = {}) => addToast({ ...options, message, type: 'error' }),
    warning: (message, options = {}) => addToast({ ...options, message, type: 'warning' }),
    info: (message, options = {}) => addToast({ ...options, message, type: 'info' }),
    custom: (options) => addToast(options)
  }

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Usage Examples:
/*
1. Wrap your app with ToastProvider in layout.js or _app.js:

import { ToastProvider } from '@/components/ui/toast'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

2. Use in any component:

import { useToast } from '@/components/ui/toast'

function MyComponent() {
  const { toast } = useToast()

  const handleClick = () => {
    // Different toast types
    toast.success("Party details saved!")
    toast.error("Cannot edit while awaiting responses")
    toast.warning("Please fill all required fields")
    toast.info("New update available")
    
    // With custom options
    toast.error("Custom error", {
      title: "Error Title",
      duration: 6000
    })
  }
}

3. For your PartyHeader use case:

const { toast } = useToast()

const handleEditClick = () => {
  if (hasEnquiriesPending) {
    toast.warning("Cannot edit party details while awaiting supplier responses", {
      title: "Party Details Locked",
      duration: 4000
    })
  } else {
    setIsEditModalOpen(true)
  }
}
*/
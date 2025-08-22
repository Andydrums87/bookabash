// components/ui/toast.jsx - Improved Toast Component
"use client"

import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

// Toast Context
const ToastContext = createContext()

// Clean toast types with better styling
const toastTypes = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-white',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-gray-900',
    textColor: 'text-gray-700',
    shadowColor: 'shadow-lg shadow-green-500/10',
    accentColor: 'border-l-green-500'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-white',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-gray-900',
    textColor: 'text-gray-700',
    shadowColor: 'shadow-lg shadow-red-500/10',
    accentColor: 'border-l-red-500'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-white',
    borderColor: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    titleColor: 'text-gray-900',
    textColor: 'text-gray-700',
    shadowColor: 'shadow-lg shadow-orange-500/10',
    accentColor: 'border-l-orange-500'
  },
  info: {
    icon: Info,
    bgColor: 'bg-white',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-gray-900',
    textColor: 'text-gray-700',
    shadowColor: 'shadow-lg shadow-blue-500/10',
    accentColor: 'border-l-blue-500'
  }
}

// Individual Toast Component
function Toast({ toast, onRemove }) {
  const config = toastTypes[toast.type] || toastTypes.info
  const Icon = config.icon

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} ${config.shadowColor} ${config.accentColor}
      border border-l-4 rounded-xl p-4 backdrop-blur-sm
      animate-in slide-in-from-right-full duration-300 ease-out
      hover:shadow-xl hover:scale-[1.02] transition-all duration-200
      max-w-sm min-w-[320px] relative overflow-hidden
    `}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className={`font-semibold ${config.titleColor} text-sm mb-1 leading-tight`}>
              {toast.title}
            </h4>
          )}
          <p className={`text-sm ${config.textColor} leading-relaxed ${toast.title ? '' : 'font-medium'}`}>
            {toast.message}
          </p>
        </div>
        
        {/* Close button */}
        <button 
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {toast.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div 
            className={`h-full transition-all ease-linear ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-orange-500' :
              'bg-blue-500'
            }`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Alternative: Minimal Style
function MinimalToast({ toast, onRemove }) {
  const config = toastTypes[toast.type] || toastTypes.info
  const Icon = config.icon

  return (
    <div className={`
      bg-white border ${config.borderColor} rounded-xl p-4 shadow-xl
      animate-in slide-in-from-right-full duration-300 ease-out
      hover:shadow-2xl transition-all duration-200
      max-w-sm min-w-[320px] backdrop-blur-sm
    `}>
      <div className="flex items-center gap-3">
        {/* Colored dot instead of icon background */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' :
          toast.type === 'warning' ? 'bg-orange-500' :
          'bg-blue-500'
        }`} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">
            {toast.message}
          </p>
        </div>
        
        {/* Close button */}
        <button 
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Modern Style with Snappy branding
function SnappyToast({ toast, onRemove }) {
  const config = toastTypes[toast.type] || toastTypes.info
  const Icon = config.icon

  return (
    <div className={`
      bg-white border border-gray-200 rounded-2xl p-4 shadow-xl
      animate-in slide-in-from-right-full duration-300 ease-out
      hover:shadow-2xl transition-all duration-200
      max-w-sm min-w-[320px] relative overflow-hidden
    `}>
      {/* Colored top border */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        toast.type === 'success' ? 'bg-green-500' :
        toast.type === 'error' ? 'bg-red-500' :
        toast.type === 'warning' ? 'bg-orange-500' :
        'bg-[hsl(var(--primary-500))]'
      }`} />
      
      <div className="flex items-start gap-3 pt-1">
        {/* Icon with Snappy colors */}
        <div className={`p-2 rounded-xl flex-shrink-0 ${
          toast.type === 'success' ? 'bg-green-50' :
          toast.type === 'error' ? 'bg-red-50' :
          toast.type === 'warning' ? 'bg-orange-50' :
          'bg-[hsl(var(--primary-50))]'
        }`}>
          <Icon className={`w-5 h-5 ${
            toast.type === 'success' ? 'text-green-600' :
            toast.type === 'error' ? 'text-red-600' :
            toast.type === 'warning' ? 'text-orange-600' :
            'text-[hsl(var(--primary-600))]'
          }`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">
            {toast.message}
          </p>
        </div>
        
        {/* Close button */}
        <button 
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
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
          // Choose your preferred style:
          <SnappyToast  // Recommended for your app
          // <Toast      // Clean with left border
          // <MinimalToast // Minimal with colored dot
            key={toast.id} 
            toast={toast} 
            onRemove={removeToast}
          />
        ))}
      </div>
    </>
  )
}

// Toast Provider Component (unchanged)
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

// Hook to use toast (unchanged)
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
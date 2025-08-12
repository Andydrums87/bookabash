// components/ui/UniversalModal.js
// Universal modal system covering all your use cases

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Sparkles, Heart } from 'lucide-react'

// Base Universal Modal
const UniversalModal = ({ 
  isOpen, 
  onClose, 
  children,
  size = 'md', // xs, sm, md, lg, xl, full
  theme = 'default', // default, fun, elegant, minimal
  showCloseButton = true,
  preventOutsideClick = false,
  className = '',
  ...props 
}) => {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !preventOutsideClick) onClose?.()
    }
    
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, preventOutsideClick])

  if (!isOpen) return null

  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm', 
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]'
  }

  const themeClasses = {
    default: 'bg-white',
    fun: 'bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]',
    elegant: 'bg-white',
    minimal: 'bg-white'
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventOutsideClick) {
      onClose?.()
    }
  }

  return (
    <div 
      className="fixed inset-0  bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`
        ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl
        ${themeClasses[theme]} ${className}
      `}>
        {/* Decorative elements for fun theme */}
        {theme === 'fun' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 left-4 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-40 animate-bounce"></div>
            <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50 animate-pulse"></div>
            <Sparkles className="absolute top-6 right-12 w-3 h-3 text-yellow-400 opacity-40 animate-pulse" />
          </div>
        )}

      
      {/* Close button */}
      <div className="relative">
{showCloseButton && (
  <button
    onClick={onClose}
    className={`absolute cursor-pointer top-4 right-4 p-1 rounded-full transition-colors z-20 ${
      theme === 'fun' 
        ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30' 
        : 'hover:bg-gray-100'
    }`}
    aria-label="Close modal"
  >
    <X className={`w-4 h-4 ${
      theme === 'fun' ? 'text-white' : 'text-gray-500'
    }`} />
  </button>
)}
      </div>
        <div className="relative z-10 h-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}

// Header Component
const ModalHeader = ({ 
  title, 
  subtitle, 
  icon, 
  theme = 'default',
  className = '' 
}) => {
  const getThemeClasses = () => {
    switch (theme) {
      case 'fun':
        return 'bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] text-white'
      case 'elegant':
        return 'bg-gray-50 border-b border-gray-200'
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
      default:
        return 'border-b border-gray-200'
    }
  }

  return (
    <div className={`p-4 sm:p-6 flex-shrink-0 ${getThemeClasses()} ${className}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`p-2 rounded-xl ${theme === 'fun' ? 'bg-white/20' : 'bg-gray-100'}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">{title}</h2>
          {subtitle && (
            <p className={`text-sm ${theme === 'fun' ? 'text-white/80' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Content Component
const ModalContent = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${className}`}>
    {children}
  </div>
)

// Footer Component  
const ModalFooter = ({ 
  children, 
  theme = 'default',
  className = '' 
}) => {
  const getThemeClasses = () => {
    switch (theme) {
      case 'elegant':
        return 'bg-gray-50 border-t border-gray-200'
      case 'fun':
        return 'bg-white/90 backdrop-blur-sm border-t border-[hsl(var(--primary-200))]'
      default:
        return 'border-t border-gray-200'
    }
  }

  return (
    <div className={`p-4 sm:p-6 flex-shrink-0 ${getThemeClasses()} ${className}`}>
      {children}
    </div>
  )
}

// Pre-built specialized modals for common patterns

// 1. Confirmation Modal
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default", // default, danger, warning, success
  isLoading = false
}) => {
  const getButtonClasses = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-600" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      default:
        return <Info className="w-6 h-6 text-primary-600" />
    }
  }

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-gray-100">
            {getIcon()}
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 ">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-10"
            disabled={isLoading}
          >
          
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${getButtonClasses()}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : confirmText}
          </Button>
        </div>
      </ModalContent>
    </UniversalModal>
  )
}

// 2. Success/Status Modal
const StatusModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "success", // success, error, info, warning
  actionText = "Got it",
  onAction,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  const [countdown, setCountdown] = useState(autoCloseDelay / 1000)

  useEffect(() => {
    if (isOpen && autoClose && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isOpen && autoClose && countdown === 0) {
      onAction ? onAction() : onClose()
    }
  }, [isOpen, autoClose, countdown, onAction, onClose])

  const getThemeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          bgClass: 'bg-green-100',
          buttonClass: 'bg-green-600 hover:bg-green-700'
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-600" />,
          bgClass: 'bg-red-100',
          buttonClass: 'bg-red-600 hover:bg-red-700'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
          bgClass: 'bg-amber-100',
          buttonClass: 'bg-amber-600 hover:bg-amber-700'
        }
      default:
        return {
          icon: <Info className="w-8 h-8 text-blue-600" />,
          bgClass: 'bg-blue-100',
          buttonClass: 'bg-blue-600 hover:bg-blue-700'
        }
    }
  }

  const config = getThemeConfig()

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className={`p-4 rounded-full ${config.bgClass}`}>
            {config.icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {autoClose && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Auto-closing in <strong>{countdown}</strong> seconds...
            </p>
          </div>
        )}

        <Button
          onClick={onAction || onClose}
          className={`w-full text-white ${config.buttonClass}`}
        >
          {actionText}
        </Button>
      </ModalContent>
    </UniversalModal>
  )
}

// 3. Selection Modal (for packages, addons, etc.)
const SelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  items = [],
  selectedId,
  onSelectItem,
  multiSelect = false,
  selectedIds = [],
  renderItem,
  confirmText = "Confirm Selection",
  theme = "default"
}) => {
  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="lg" theme={theme}>
      <ModalHeader 
        title={title}
        subtitle={subtitle}
        theme={theme}
        icon={<Sparkles className="w-6 h-6" />}
      />
      
      <ModalContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id}>
              {renderItem ? renderItem(item, selectedId === item.id || selectedIds.includes(item.id)) : (
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    (selectedId === item.id || selectedIds.includes(item.id))
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => onSelectItem(item)}
                >
                  <h4 className="font-semibold">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  {item.price && (
                    <p className="text-primary-600 font-bold mt-2">£{item.price}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ModalContent>

      <ModalFooter theme={theme}>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={!selectedId && selectedIds.length === 0}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
          >
            {confirmText}
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

export { 
  UniversalModal, 
  ModalHeader, 
  ModalContent, 
  ModalFooter,
  ConfirmationModal,
  StatusModal,
  SelectionModal
}
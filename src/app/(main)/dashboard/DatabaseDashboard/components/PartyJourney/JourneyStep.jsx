// components/PartyJourney/JourneyStep.jsx - SIMPLIFIED COLORS
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Lock, Circle, ArrowRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { SupplierJourneyStep } from './SupplierJourneyStep'
import { VenueConfirmationStep } from './VenueConfirmationStep'
import { PartyTeamBrowseStep } from './PartyTeamBrowseStep'
import { useToast } from '@/components/ui/toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function JourneyStep({
  step,
  isLast,
  partyId,
  partyDetails,
  hasCreatedInvites,
  onCreateInvites,
  suppliers,
  enquiries,
  onAddSupplier,
  onRemoveSupplier,
  loadingCards,
  getSupplierDisplayName,
  onViewSupplierDetails,
  addons,
  handleRemoveAddon,
  isPaymentConfirmed,
  currentPhase,
  onPaymentReady,
  handleCancelEnquiry,
  getSupplierDisplayPricing,
  // Edit booked supplier props
  onEditSupplier,
  partyDate,
}) {
  // All steps collapsed by default
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()

  // Handle click on locked step - show helpful toast (keep it warm and friendly!)
  const handleLockedClick = () => {
    if (!step.unlockMessage) return

    // Customize message based on step type - friendly tone!
    let title = "Hold tight!"
    let message = step.unlockMessage

    if (step.id === 'create_einvites') {
      title = "Almost there!"
      message = "Hold tight! Your venue is reviewing your booking now. As soon as they confirm, you can start creating your invites. Usually just a few hours! 🎉"
    } else if (step.id === 'venue_confirmation') {
      title = "One quick step"
      message = step.unlockMessage
    } else if (step.id === 'final_details') {
      title = "Coming soon!"
      message = "We'll send you final party details and your complete checklist 7 days before the big day. You'll get a notification when it's ready!"
    }

    toast.info(message, {
      title,
      duration: 5000
    })
  }

  // Clean, minimal styling with coral accents
  const getStatusStyles = () => {
    if (step.status === 'completed') {
      return {
        border: 'border-gray-200',
        bg: 'bg-white',
        icon: <CheckCircle className="w-5 h-5 text-[hsl(var(--primary-500))]" />,
        titleColor: 'text-gray-900',
        descColor: 'text-gray-600',
        iconBg: 'bg-[hsl(var(--primary-50))]',
        disabled: false
      }
    }

    if (step.status === 'locked') {
      return {
        border: 'border-gray-200',
        bg: 'bg-gray-50',
        icon: <Lock className="w-5 h-5 text-gray-400" />,
        titleColor: 'text-gray-400',
        descColor: 'text-gray-400',
        iconBg: 'bg-gray-100',
        disabled: true
      }
    }

    // Default: current or available (white background)
    return {
      border: 'border-gray-200',
      bg: 'bg-white',
      icon: <Circle className="w-5 h-5 text-gray-400" />,
      titleColor: 'text-gray-900',
      descColor: 'text-gray-600',
      iconBg: 'bg-gray-50',
      disabled: false
    }
  }

  const styles = getStatusStyles()

  const renderStepContent = () => {
    switch (step.id) {
      case 'payment_complete':
        return (
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Payment complete — your party is confirmed!
            </p>
          </div>
        )
         // ✅ NEW: Venue Confirmation Step
    case 'venue_confirmation':
        return (
          <VenueConfirmationStep
            venueSupplier={step.venueSupplier}
            venueEnquiry={step.venueEnquiry}
            onAddSupplier={onAddSupplier}
            onRemoveSupplier={onRemoveSupplier}
            getSupplierDisplayName={getSupplierDisplayName}
            loadingCards={loadingCards}
            partyDetails={partyDetails}
            addons={addons}
            handleRemoveAddon={handleRemoveAddon}
            isPaymentConfirmed={isPaymentConfirmed}
            enquiries={enquiries}
            currentPhase={currentPhase}
            onPaymentReady={onPaymentReady}
            handleCancelEnquiry={handleCancelEnquiry}
            getSupplierDisplayPricing={getSupplierDisplayPricing}
          />
        )

case 'party_team_browse':
    return (
      <PartyTeamBrowseStep
        suppliers={step.suppliers}
        enquiries={enquiries}
        onAddSupplier={onAddSupplier}
        onRemoveSupplier={onRemoveSupplier}
        getSupplierDisplayName={getSupplierDisplayName}
        loadingCards={loadingCards}
        partyDetails={partyDetails}
        addons={addons}
        handleRemoveAddon={handleRemoveAddon}
        isPaymentConfirmed={isPaymentConfirmed}
        currentPhase={currentPhase}
        onPaymentReady={onPaymentReady}
        handleCancelEnquiry={handleCancelEnquiry}
        getSupplierDisplayPricing={getSupplierDisplayPricing}
        totalPossibleSuppliers={step.metrics.total}
        addedCount={step.metrics.added}
      />
    )

        // ✅ UPDATED: Party Team (now excludes venue)
    case 'party_team':
        return (
          <SupplierJourneyStep
            suppliers={suppliers}
            enquiries={enquiries}
            onAddSupplier={onAddSupplier}
            onRemoveSupplier={onRemoveSupplier}
            getSupplierDisplayName={getSupplierDisplayName}
            loadingCards={loadingCards}
            allConfirmed={step.allConfirmed}
            partyDetails={partyDetails}
            addons={addons}
            handleRemoveAddon={handleRemoveAddon}
            isPaymentConfirmed={isPaymentConfirmed}
            currentPhase={currentPhase}
            onPaymentReady={onPaymentReady}
            handleCancelEnquiry={handleCancelEnquiry}
            getSupplierDisplayPricing={getSupplierDisplayPricing}
            excludeVenue={true} // ✅ NEW: Tell it to exclude venue
            onEditSupplier={onEditSupplier}
            partyDate={partyDate}
          />
        )

      case 'suppliers_confirm':
        return (
          <SupplierJourneyStep
            suppliers={suppliers}
            enquiries={enquiries}
            onAddSupplier={onAddSupplier}
            onRemoveSupplier={onRemoveSupplier}
            getSupplierDisplayName={getSupplierDisplayName}
            loadingCards={loadingCards}
            allConfirmed={step.allConfirmed}
            partyDetails={partyDetails}
            addons={addons}
            handleRemoveAddon={handleRemoveAddon}
            isPaymentConfirmed={isPaymentConfirmed}
            currentPhase={currentPhase}
            onPaymentReady={onPaymentReady}
            handleCancelEnquiry={handleCancelEnquiry}
            getSupplierDisplayPricing={getSupplierDisplayPricing}
            onEditSupplier={onEditSupplier}
            partyDate={partyDate}
          />
        )
      
      case 'guest_list':
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            {step.action && (
              <Button asChild className="w-full bg-primary-600 hover:bg-primary-700">
                <Link href={step.action.href}>
                  {step.action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        )
      
      case 'gift_registry':
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            {step.action && (
              <Button asChild className="w-full bg-primary-600 hover:bg-primary-700">
                <Link href={step.action.href}>
                  {step.action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        )
      
      case 'create_einvites':
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            {hasCreatedInvites ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-gray-900">Your invites are ready!</p>
                </div>
                {step.action && (
                  <Button asChild className="w-full bg-primary-600 hover:bg-primary-700">
                    <Link href={step.action.href}>
                      Manage & Share Invites
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                {step.action && (
                  <Button asChild className="w-full bg-primary-600 hover:bg-primary-700">
                    <Link href={step.action.href}>
                      {step.action.label}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        )
      
      case 'send_invites':
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            {step.metrics && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Invitations sent</span>
                  <span className="font-bold text-gray-900">
                    {step.metrics.sent} / {step.metrics.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(step.metrics.sent / Math.max(step.metrics.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {step.action && (
              <Button asChild className="w-full bg-primary-600 hover:bg-primary-700">
                <Link href={step.action.href}>
                  {step.action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        )
      
        case 'track_rsvps':
        // Step 7 - locked if shown while locked
        if (step.status === 'locked') {
          return null
        }
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            {step.metrics && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">RSVPs received</span>
                  <span className="font-bold text-gray-900">
                    {step.metrics.confirmed} / {step.metrics.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(step.metrics.confirmed / Math.max(step.metrics.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {step.action && (
              <Button asChild className="w-full bg-primary-600 hover:bg-primary-700">
                <Link href={step.action.href}>
                  {step.action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        )
      
      case 'final_details':
        // Step 8 - locked if shown while locked
        if (step.status === 'locked') {
          return null
        }
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Final party details and supplier confirmations will be available 7 days before your party date. 
              We'll send you a complete checklist with all the important information.
            </p>
          </div>
        )
      
      default:
        return null
    }
  }

  // ✅ Wrapper for locked steps with tooltip
  const CardWrapper = ({ children }) => {
    if (styles.disabled && step.unlockMessage) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {children}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{step.unlockMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    return children
  }

  return (
    <div className="relative">
      <CardWrapper>
        <div
          className={`
            transition-all rounded-2xl border bg-white
            ${styles.disabled
              ? 'opacity-50 cursor-pointer hover:opacity-60 border-gray-200'
              : 'hover:shadow-md cursor-pointer border-gray-200 hover:border-gray-300'}
            ${step.status === 'completed' ? 'border-l-4 border-l-[hsl(var(--primary-500))]' : ''}
          `}
        >
          {/* ✅ COMPACT SINGLE-LINE HEADER */}
          <div
            className="py-3.5 px-4"
            onClick={() => {
              if (styles.disabled) {
                handleLockedClick()
              } else {
                setIsExpanded(!isExpanded)
              }
            }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              {/* Icon - smaller on mobile */}
              <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center relative flex-shrink-0">
                {typeof step.icon === 'string' && (step.icon.startsWith('http://') || step.icon.startsWith('https://') || step.icon.startsWith('/')) ? (
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="w-8 h-8 md:w-12 md:h-12 object-contain"
                  />
                ) : (
                  <span className="text-base md:text-xl">{step.icon}</span>
                )}

                {/* Lock overlay for locked steps */}
                {styles.disabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Lock className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Title - single line on mobile */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                <span className={`text-xs md:text-sm font-medium ${styles.disabled ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}>
                  {step.number}.
                </span>
                <h3 className={`text-sm md:text-base font-semibold ${styles.titleColor} truncate`}>
                  {step.title}
                  {step.titleSuffix && (
                    <span className="text-gray-400 font-normal ml-1">{step.titleSuffix}</span>
                  )}
                </h3>
                {/* Status indicator on mobile */}
                {step.status === 'completed' && (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 md:hidden" />
                )}
              </div>

              {/* Collapse Toggle */}
              {!styles.disabled && (
                <button className="p-1 md:p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ✅ COLLAPSIBLE CONTENT */}
          {isExpanded && !styles.disabled && (
            <div className="px-4 pb-4 pt-0">
              {/* Subtitle */}
              {step.subtitle && (
                <p className="text-sm text-gray-600 mb-3">{step.subtitle}</p>
              )}
              {/* Step Content */}
              {renderStepContent()}
            </div>
          )}
        </div>
      </CardWrapper>
    </div>
  )
}
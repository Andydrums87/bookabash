// components/PartyJourney/JourneyStep.jsx - SIMPLIFIED COLORS
"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Lock, Circle, ArrowRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { SupplierJourneyStep } from './SupplierJourneyStep'
import { VenueConfirmationStep } from './VenueConfirmationStep'
import { PartyTeamBrowseStep } from './PartyTeamBrowseStep'
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
              Your deposit has been secured and your party is confirmed!
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
        <Card
          className={`
            ${styles.border}
            ${styles.bg}
            transition-all
            ${styles.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
            ${step.status === 'completed' ? 'border-l-4 border-l-[hsl(var(--primary-500))]' : ''}
          `}
        >
          {/* ✅ CLEAN HEADER */}
          <div
            className={`p-3 ${styles.disabled ? 'pointer-events-none' : ''}`}
            onClick={() => !styles.disabled && setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center relative">
                  {/* Check if icon is a URL or emoji */}
                  {typeof step.icon === 'string' && (step.icon.startsWith('http://') || step.icon.startsWith('https://') || step.icon.startsWith('/')) ? (
                    <img
                      src={step.icon}
                      alt={step.title}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <span className="text-xl">{step.icon}</span>
                  )}

                  {/* Lock overlay for locked steps */}
                  {styles.disabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${styles.disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                      Step {step.number}
                    </span>
                    <h3 className={`text-base font-bold ${styles.titleColor} truncate`}>
                      {step.title}
                    </h3>
                  </div>
                  {!isExpanded && step.status === 'completed' && (
                    <p className={`text-xs ${styles.descColor} mt-0.5 line-clamp-1`}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Collapse Toggle - only show if not disabled */}
              {!styles.disabled && (
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
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
            <CardContent className="px-4 pb-4 pt-0">
              {/* Step Content */}
              {renderStepContent()}
            </CardContent>
          )}
        </Card>
      </CardWrapper>

      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-10 top-full w-0.5 h-6 bg-gray-200 -mt-2 z-0" />
      )}
    </div>
  )
}
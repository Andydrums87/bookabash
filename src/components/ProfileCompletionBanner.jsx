// components/ProfileCompletionBanner.jsx - UPDATED FOR MULTI-BUSINESS

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, ArrowRight, Crown, Building2 } from 'lucide-react'
import { calculateProfileCompletion } from '@/utils/profileCompletion'

export const ProfileCompletionBanner = ({ 
  supplierData, 
  businessType, 
  onNavigate, 
  onGoLive,
  isPrimary = true,  // 🆕 NEW: Add isPrimary flag
  businessName       // 🆕 NEW: For better messaging
}) => {

  
 // AFTER (fixed):
const completion = supplierData?.profile_status === 'live' 
? {
    percentage: supplierData.profile_completion_percentage || 100,
    canGoLive: supplierData.can_go_live || true,
    missingFields: []
  }
: calculateProfileCompletion(supplierData, businessType, isPrimary)
  
console.log('📊 CALCULATED COMPLETION:', {
    'percentage': completion.percentage,
    'canGoLive': completion.canGoLive,
    'missingFields': completion.missingFields.map(f => f.field)
  })

  // 🆕 UPDATED: More nuanced banner visibility logic
  const shouldShowBanner = () => {
    if (isPrimary) {
      const isLive = supplierData?.profile_status === 'live'
      const isComplete = completion.percentage >= 100
      const shouldHide = isLive && isComplete
      return !shouldHide
    } else {
      // FIXED: Themed business logic - show banner unless actually live
      const isLive = supplierData?.profile_status === 'live'
      return !isLive  // Show banner until actually live (not just ready_for_review)
    }
  }
  if (!shouldShowBanner()) {
    console.log('🚫 Banner hidden - criteria not met', {
      isPrimary,
      profile_status: supplierData?.profile_status,
      completion: completion.percentage
    })
    return null
  }

  // Different messaging for primary vs themed businesses
  const getBannerContent = () => {
    if (isPrimary) {
      return {
        title: `Your profile isn't live yet (${completion.percentage}% complete)`,
        subtitle: "Complete these essential details to start receiving bookings from customers.",
        icon: <AlertCircle className="w-5 h-5" />,
        buttonText: "Complete Profile",
        readyMessage: "Ready to go live! Click below to make your profile visible to customers."
      }
    } else {
      return {
        title: `${businessName || 'Themed business'} setup (${completion.percentage}% complete)`,
        subtitle: "Complete the theme-specific details for this business to make it bookable.",
        icon: <Building2 className="w-5 h-5" />,
        buttonText: "Complete Theme Setup", 
        readyMessage: "Theme business ready! Click below to make this business visible to customers."
      }
    }
  }

  const content = getBannerContent()

  return (
    <div className={`border rounded-lg p-6 mb-6 ${
      isPrimary 
        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' 
        : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`font-semibold mb-2 flex items-center gap-2 ${
            isPrimary ? 'text-blue-900' : 'text-purple-900'
          }`}>
            {content.icon}
            {content.title}
            {!isPrimary && <Building2 className="w-4 h-4 ml-1" />}
          </h3>
          
          <p className={`text-sm mb-4 ${
            isPrimary ? 'text-blue-700' : 'text-purple-700'
          }`}>
            {content.subtitle}
          </p>
          
          <Progress 
            value={completion.percentage} 
            className={`h-3 mb-4 ${
              isPrimary ? 'bg-blue-100' : 'bg-purple-100'
            }`} 
          />
          
          {/* Missing items - show fewer for themed businesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {completion.missingFields.slice(0, isPrimary ? 4 : 3).map(field => (
              <div key={field.field} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 border-2 rounded ${
                  isPrimary ? 'border-blue-400' : 'border-purple-400'
                }`}></div>
                <span className={isPrimary ? 'text-blue-700' : 'text-purple-700'}>
                  {field.displayName}
                </span>
              </div>
            ))}
            {completion.missingFields.length > (isPrimary ? 4 : 3) && (
              <div className={`text-sm ${isPrimary ? 'text-blue-600' : 'text-purple-600'}`}>
                +{completion.missingFields.length - (isPrimary ? 4 : 3)} more items
              </div>
            )}
          </div>
          
          {completion.canGoLive && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <p className="text-green-800 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {content.readyMessage}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {completion.canGoLive ? (
            <Button 
              onClick={onGoLive}
              className={isPrimary 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-purple-600 hover:bg-purple-700"
              }
            >
              Go Live Now
            </Button>
          ) : (
            <Button 
              onClick={() => onNavigate('/suppliers/profile')}
              variant="outline"
              className={`border-2 ${
                isPrimary 
                  ? 'border-blue-600 text-blue-600 hover:bg-blue-50' 
                  : 'border-purple-600 text-purple-600 hover:bg-purple-50'
              }`}
            >
              {content.buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
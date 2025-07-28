"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Gift, X, CheckCircle, Clock, Loader2, Send, Edit } from "lucide-react"

export default function MobileSupplierCard({ 
  type, 
  supplier, 
  loadingCards = [],
  suppliersToDelete = [],
  openSupplierModal,
  handleDeleteSupplier,
  getSupplierDisplayName,
  addons = [],
  handleRemoveAddon,
  // New props for enquiry state (only used when user is signed in)
  enquiryStatus = null, // 'pending', 'accepted', 'declined' 
  isSignedIn = false, // Whether user is signed in (determines if we use database or localStorage)
  enquiries = [],
  isPaymentConfirmed = false,
}) {
  const isLoading = loadingCards.includes(type)
  const isDeleting = suppliersToDelete.includes(type)
  
  // Determine the actual state to show
  const getSupplierState = () => {
    if (!supplier) return 'empty'
    
    // DEBUG: Log the current state values
    console.log(`🔍 ${type} Card State Debug:`, {
      isPaymentConfirmed,
      isSignedIn,
      enquiryStatus,
      supplier: supplier?.name
    })
    
    // If user is not signed in, only show 'selected' state
    if (!isSignedIn) {
      return 'selected'
    }
    
    // If user is signed in, check enquiry status from database FIRST
    switch (enquiryStatus) {
      case 'pending':
        return 'awaiting_response'
      case 'accepted':
        // IMPORTANT: Check if payment is confirmed ONLY for accepted enquiries
        if (isPaymentConfirmed) {
          return 'payment_confirmed'
        }
        return 'confirmed' // Enquiry accepted but not paid yet
      case 'declined':
        return 'declined'
      default:
        return 'selected' // No enquiry sent yet, or enquiry status unknown
    }
  }

  const supplierState = getSupplierState()
  const supplierAddons = addons.filter(addon => addon.supplierId === supplier?.id)
  
  // Get contact details from enquiries for payment confirmed state
  const getContactDetails = () => {
    if (!isPaymentConfirmed) return null
    
    console.log('🔍 Looking for contact details for type:', type)
    
    if (enquiries && enquiries.length > 0) {
      const enquiry = enquiries.find(e => e.supplier_category === type)
      console.log('📧 Found enquiry for', type, ':', enquiry)
      
      if (enquiry && enquiry.suppliers && enquiry.suppliers.data && enquiry.suppliers.data.owner) {
        const owner = enquiry.suppliers.data.owner
        const contactDetails = {
          phone: owner.phone,
          email: owner.email,
          name: owner.name || `${owner.firstName} ${owner.lastName}`.trim()
        }
        
        console.log('📞 Contact details found:', contactDetails)
        return contactDetails
      }
    }
    
    console.log('⚠️ No contact details found in enquiries')
    return null
  }

  const contactDetails = getContactDetails()
  
  // Handle empty supplier slot
  if (supplierState === 'empty') {
    // Don't allow adding suppliers after payment
    if (isPaymentConfirmed) {
      return null // Don't render empty slots after payment
    }

    return (
      <Card className="border-2 border-dashed border-gray-300 overflow-hidden rounded-lg">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center h-48">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">+</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Find the perfect {type} for your party
            </p>
            <Button 
              variant="outline" 
              onClick={() => openSupplierModal(type)}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Browse {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Special handling for einvites card
  if (type === "einvites") {
    const hasGeneratedInvite = supplier?.image && supplier.image !== "/placeholder.jpg" && supplier?.status === "created";
    
    return (
      <Card className="border-primary-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span className="font-medium text-gray-700">E-Invites</span>
            </div>
            <div className="flex items-center space-x-2">
              {hasGeneratedInvite && !isPaymentConfirmed && (
                <button
                  onClick={() => handleDeleteSupplier(type)}
                  className="px-2 py-1 bg-white/90 hover:bg-white rounded text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 shadow-sm transition-colors"
                  title="Remove custom invite"
                >
                  Remove
                </button>
              )}
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
          
          <div className="relative w-full h-[160px] overflow-hidden">
            {hasGeneratedInvite ? (
              <img
                src={supplier.image}
                alt={supplier?.name || "Digital Invites"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                  <span className="text-primary font-medium text-lg">Digital Invites</span>
                </div>
              </div>
            )}
            
            {hasGeneratedInvite && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white shadow-lg">
                  ✨ Created
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{supplier?.name || "Digital Invites"}</h3>
            <p className="text-sm text-gray-600 mb-4">{supplier?.description || "Themed e-invitations"}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-gray-900">£{supplier?.price || 25}</span>
              <Badge className={
                hasGeneratedInvite 
                  ? "bg-green-500/10 text-green-700 border-green-200" 
                  : "bg-primary/10 text-primary border-primary/30"
              }>
                {hasGeneratedInvite ? "Ready to Send" : "Create Invites"}
              </Badge>
            </div>
          </div>
          {!isPaymentConfirmed && (
            <div className="px-4 pb-4">
              <Button 
                className="w-full bg-primary hover:bg-primary-light text-primary-foreground"
                onClick={() => window.location.href = '/e-invites'}
              >
                {hasGeneratedInvite ? "Edit & Send Invites" : "Create & Send Invites"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Get state-specific styling and content
  const getStateConfig = (state) => {
    switch (state) {
      case 'payment_confirmed':
        return {
          borderClass: 'border-green-400 bg-green-50/30',
          overlayContent: null,
          badgeClass: 'text-green-700 border-green-300 bg-green-50',
          badgeText: '✅ Confirmed & Paid',
          imageOpacity: '',
          canEdit: false,
          canRemoveAddons: false,
          showChangeButton: false
        }
      case 'selected':
        return {
          borderClass: 'border-[hsl(var(--primary-500))]',
          overlayContent: null,
          badgeClass: 'text-blue-700 border-blue-300 bg-blue-50',
          badgeText: 'Selected',
          imageOpacity: '',
          canEdit: true,
          canRemoveAddons: true,
          showChangeButton: true
        }
      case 'awaiting_response':
        return {
          borderClass: 'border-yellow-300 bg-yellow-50/50',
          overlayContent: (
            <div className="absolute inset-0 bg-yellow-50/80 backdrop-blur-sm z-30 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-10 h-10 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-base font-semibold text-yellow-800 mb-2">Awaiting Response</h3>
                <p className="text-xs text-yellow-700 mb-3">
                  We've sent your enquiry to {supplier.name}
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-yellow-600 mb-3">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span>Response expected within 24 hours</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSupplier(type)}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 text-xs px-3 py-1"
                >
                  Cancel Request
                </Button>
              </div>
            </div>
          ),
          badgeClass: 'text-yellow-700 border-yellow-300 bg-yellow-50',
          badgeText: 'Enquiry Sent',
          imageOpacity: 'opacity-40 grayscale',
          canEdit: false,
          canRemoveAddons: false,
          showChangeButton: false
        }
      case 'confirmed':
        return {
          borderClass: 'border-green-300 bg-green-50/50',
          overlayContent: null,
          badgeClass: 'text-green-700 border-green-300 bg-green-50',
          badgeText: 'Confirmed',
          imageOpacity: '',
          canEdit: false,
          canRemoveAddons: true,
          showChangeButton: false
        }
      case 'declined':
        return {
          borderClass: 'border-red-300 bg-red-50/50',
          overlayContent: (
            <div className="absolute inset-0 bg-red-50/80 backdrop-blur-sm z-30 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-10 h-10 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-semibold text-red-800 mb-2">Declined</h3>
                <p className="text-xs text-red-700 mb-3">
                  {supplier.name} is not available for your date
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openSupplierModal(type)}
                  className="border-red-300 text-red-700 hover:bg-red-100 text-xs px-3 py-1"
                >
                  Find Alternative
                </Button>
              </div>
            </div>
          ),
          badgeClass: 'text-red-700 border-red-300 bg-red-50',
          badgeText: 'Declined',
          imageOpacity: 'opacity-40 grayscale',
          canEdit: true,
          canRemoveAddons: false,
          showChangeButton: true
        }
      default:
        return getStateConfig('selected')
    }
  }

  const stateConfig = getStateConfig(supplierState)

  // Regular supplier card with state-aware styling - optimized for mobile
  return (
    <Card className={`overflow-hidden rounded-lg border shadow-sm transition-all duration-300 relative ${
      stateConfig.borderClass
    } ${isDeleting ? 'opacity-50 scale-95' : ''}`}>
      
      {/* State Overlay */}
      {stateConfig.overlayContent}

      <div className="relative aspect-[2/2] w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <div className="absolute top-[-10px] left-0 w-full h-full">
              <div
                className={`relative w-[90%] h-[100%] mask-image mx-auto mt-10 transition-all duration-300 ${
                  stateConfig.imageOpacity
                }`}
                style={{
                  WebkitMaskImage: 'url("/image.svg")',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskImage: 'url("/image.svg")',
                  maskRepeat: 'no-repeat',
                  maskSize: 'contain',
                  maskPosition: 'center',
                }}
              >
                <Image
                  src={
                    supplier.image ||
                    supplier.imageUrl ||
                    `/placeholder.svg?height=256&width=256&query=${supplier.name?.replace(/\s+/g, "+")}+package`
                  }
                  alt={supplier.name}
                  fill
                  className="object-cover group-hover:brightness-110 transition-all duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
            
            {/* Category badge with state-aware color */}
            <div className={`absolute px-4 py-2 top-3 rounded-full left-3 flex items-center space-x-2 text-white text-xs z-10 ${
              supplierState === 'payment_confirmed' ? 'bg-green-500' :
              supplierState === 'awaiting_response' ? 'bg-yellow-500' : 
              supplierState === 'confirmed' ? 'bg-green-500' :
              supplierState === 'declined' ? 'bg-red-500' :
              'bg-primary-500'
            }`}>
              <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
            
            {/* Change/Remove buttons - Updated logic */}
            {(stateConfig.canEdit || stateConfig.showChangeButton) && (
              <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteSupplier(type)}
                  className="px-2 py-1 bg-white/90 hover:bg-white rounded text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 shadow-sm transition-colors"
                  title={`Remove ${type} supplier`}
                >
                  Remove
                </button>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    supplierState === 'payment_confirmed' ? "bg-green-400" :
                    supplierState === 'confirmed' ? "bg-green-400" : 
                    supplierState === 'awaiting_response' ? "bg-yellow-400" :
                    supplierState === 'declined' ? "bg-red-400" :
                    "bg-blue-400"
                  }`}
                />
              </div>
            )}
          </>
        )}
      </div>
    
      <CardContent className="px-4 pt-4 pb-5">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{supplier.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-gray-900">£{supplier.price}</span>
              <Badge
                variant="outline"
                className={stateConfig.badgeClass}
              >
                {stateConfig.badgeText}
              </Badge>
            </div>

            {/* Add-ons Section */}
            {supplierAddons.length > 0 && (
              <div className={`mt-4 pt-4 border-t border-gray-100 ${
                !stateConfig.canRemoveAddons ? 'pointer-events-none' : ''
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Gift className="w-4 h-4" />
                    Selected Add-ons
                  </h4>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {supplierAddons.length} added
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {supplierAddons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{addon.name}</p>
                        <p className="text-xs text-gray-600">{addon.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary-600">£{addon.price}</span>
                        {stateConfig.canRemoveAddons && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveAddon(addon.id)
                            }}
                            className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove add-on"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total for this supplier's add-ons */}
                {supplierAddons.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">Add-ons Total:</span>
                      <span className="font-bold text-primary-600">
                        £{supplierAddons.reduce((sum, addon) => sum + addon.price, 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment confirmed contact details */}
            {isPaymentConfirmed && (
              <div className="space-y-2 mt-4">
                {contactDetails ? (
                  <>
                    {/* Show supplier name */}
                    {contactDetails.name && (
                      <p className="text-sm font-medium text-green-800 text-center">
                        Contact: {contactDetails.name}
                      </p>
                    )}
                    
                    <div className="flex space-x-2">
                      {contactDetails.phone && (
                        <Button
                          asChild
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          <a href={`tel:${contactDetails.phone}`}>
                            📞 Call
                          </a>
                        </Button>
                      )}
                      {contactDetails.email && (
                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 border-green-300 text-green-700 hover:bg-green-50 text-sm"
                        >
                          <a href={`mailto:${contactDetails.email}`}>
                            📧 Email
                          </a>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-green-600 text-center">
                      Contact directly for party arrangements
                    </p>
                  </>
                ) : (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                      Contact details will be available once payment is confirmed
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Change Supplier Button for Selected State */}
            {!isPaymentConfirmed && stateConfig.canEdit && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                
                <Button
                  variant="outline"
                  className="w-full bg-primary-500 border-none text-white hover:text-white hover:bg-[hsl(var(--primary-700))]"
                  onClick={() => openSupplierModal(type)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Removing..." : `Change ${getSupplierDisplayName(type)}`}
                </Button>
                
              </div>
            )}
            
          </>
        )}
        
      </CardContent>
      
    </Card>
    
  )
}
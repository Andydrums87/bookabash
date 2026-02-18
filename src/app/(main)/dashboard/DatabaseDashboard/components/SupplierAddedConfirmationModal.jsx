"use client"

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Check, ShoppingBag, CreditCard, X, Clock, Sparkles, Plus, CheckCircle, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { roundMoney } from '@/utils/unifiedPricing'

export default function SupplierAddedConfirmationModal({
  isOpen,
  onClose,
  onSendEnquiry,
  supplier,
  selectedPackage: initialPackage,
  partyDetails,
  isSending = false,
  partyId,
  onGoToPayment,
}) {
  const [selectedPackage, setSelectedPackage] = useState(initialPackage || null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [selectedPackageForModal, setSelectedPackageForModal] = useState(null)
  const [partyBagsQuantity, setPartyBagsQuantity] = useState(Number(partyDetails?.guestCount) || 10)

  // Get packages from supplier data or create fallback packages
  const packages = useMemo(() => {
    if (!supplier) return []

    // Check if supplier has real packages
    const realPackages = supplier?.packages || supplier?.packageData?.packages || []

    if (realPackages && realPackages.length > 0) {
      return realPackages.slice(0, 3)
    }

    // Create fallback packages based on base price
    const basePrice = supplier.priceFrom || supplier.price || 100
    const priceUnit = supplier.priceUnit || "per event"

    const basicPrice = Math.round(basePrice * 1.0)
    const premiumPrice = Math.round(basePrice * 1.5)
    const deluxePrice = Math.round(basePrice * 2.0)

    return [
      {
        id: "basic",
        name: "Basic Package",
        price: basicPrice,
        duration: priceUnit,
        features: ["Standard service", "Up to 15 children", "Basic setup"],
        description: `Basic ${supplier.category?.toLowerCase() || 'service'} package`,
        popular: false,
      },
      {
        id: "premium",
        name: "Premium Package",
        price: premiumPrice,
        duration: priceUnit,
        features: ["Enhanced service", "Professional setup", "Up to 25 children"],
        description: `Enhanced ${supplier.category?.toLowerCase() || 'service'} package`,
        popular: true,
      },
      {
        id: "deluxe",
        name: "Deluxe Package",
        price: deluxePrice,
        duration: priceUnit,
        features: ["Premium service", "Full setup & cleanup", "Up to 35 children"],
        description: `Complete ${supplier.category?.toLowerCase() || 'service'} package`,
        popular: false,
      },
    ]
  }, [supplier])

  const hasPackages = packages.length > 0

  // Get addons from supplier data
  const addons = supplier?.addons || supplier?.data?.addons || []
  const hasAddons = addons.length > 0

  // Detect if this is a party bags supplier
  const isPartyBags = supplier?.category === "Party Bags" ||
                      supplier?.category?.toLowerCase().includes("party bag")

  // Reset selected package when supplier changes - select cheapest by default
  useEffect(() => {
    if (supplier && isOpen) {
      // Reset to cheapest package when modal opens or supplier changes
      if (hasPackages && packages.length > 0) {
        // Find the cheapest package
        const cheapestPackage = packages.reduce((cheapest, pkg) => {
          return (pkg.price || 0) < (cheapest.price || 0) ? pkg : cheapest
        }, packages[0])
        setSelectedPackage(cheapestPackage)
      } else {
        setSelectedPackage(null)
      }
      // Also reset selected addons
      setSelectedAddons([])
    }
  }, [supplier?.id, isOpen, hasPackages, packages])

  // Initialize party bags quantity from existing data or guest count
  useEffect(() => {
    if (isOpen && isPartyBags) {
      // Check if supplier already has a custom quantity set
      const existingQuantity = supplier?.partyBagsQuantity ||
                               supplier?.packageData?.partyBagsQuantity ||
                               supplier?.partyBagsMetadata?.quantity

      if (existingQuantity) {
        console.log('🎒 Restoring party bags quantity:', existingQuantity)
        setPartyBagsQuantity(Number(existingQuantity))
      } else {
        // Default to guest count
        setPartyBagsQuantity(Number(partyDetails?.guestCount) || 10)
      }
    }
  }, [isOpen, isPartyBags, supplier, partyDetails?.guestCount])

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!supplier) return 0
    let packagePrice = selectedPackage?.price || supplier.price || supplier.priceFrom || 0

    // For party bags, multiply by quantity (use roundMoney to avoid floating point issues)
    if (isPartyBags) {
      packagePrice = roundMoney(packagePrice * partyBagsQuantity)
    }

    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
    return roundMoney(packagePrice + addonsTotal)
  }, [selectedPackage, selectedAddons, supplier, isPartyBags, partyBagsQuantity])

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Return null AFTER all hooks
  if (!supplier) return null

  const handleAddToCart = async (goToPayment = false) => {
    if (!partyId || !onSendEnquiry) {
      console.error('❌ Missing partyId or onSendEnquiry')
      return
    }

    // Get selected addon objects
    const selectedAddonObjects = selectedAddons
      .map((addon) => {
        if (!addon) return null
        return {
          ...addon,
          supplierId: supplier.id,
          supplierName: supplier.name,
          attachedToSupplier: true,
          isSupplierAddon: true,
          supplierType: supplier.category,
          addedAt: new Date().toISOString(),
          displayId: `${supplier.id}-${addon.id}`,
        }
      })
      .filter(Boolean)

    // Create enhanced package with party bags metadata if needed
    let finalPackage = selectedPackage

    if (isPartyBags && selectedPackage) {
      const pricePerBag = selectedPackage.price
      const partyBagsTotalPrice = roundMoney(pricePerBag * partyBagsQuantity)
      finalPackage = {
        ...selectedPackage,
        price: pricePerBag,
        originalPrice: pricePerBag,
        totalPrice: partyBagsTotalPrice,
        partyBagsQuantity: partyBagsQuantity,
        guestCount: partyDetails?.guestCount || 10,
        pricePerBag: pricePerBag,
        partyBagsMetadata: {
          quantity: partyBagsQuantity,
          pricePerBag: pricePerBag,
          totalPrice: partyBagsTotalPrice,
        },
      }
    }

    // Add supplier with selected package and addons
    await onSendEnquiry(supplier, finalPackage, partyId, selectedAddonObjects)

    // If going to payment, trigger navigation
    if (goToPayment && onGoToPayment) {
      onGoToPayment()
    } else {
      // If keeping browsing, scroll to top after a short delay so they can see the cart
      // Delay ensures the modal has closed and page has updated
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 300)
    }
  }

  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id)
      if (exists) {
        return prev.filter(a => a.id !== addon.id)
      } else {
        return [...prev, addon]
      }
    })
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[85vh] md:h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between flex-shrink-0 bg-primary-500">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-white/30 shadow-sm flex-shrink-0">
              <Image
                src={supplier.image || supplier.imageUrl || "/placeholder.png"}
                alt={supplier.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white truncate">{supplier.name}</h2>
              <p className="text-sm text-white/80 capitalize">{supplier.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <div className="p-6 space-y-8">
            {/* Packages Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">Choose Your Package</h3>
              </div>

              <div className="relative -mx-6">
                <div
                  className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-6 snap-x snap-mandatory"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {packages.length > 0 ? (
                    packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id
                      return (
                        <div
                          key={pkg.id}
                          className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer group relative flex-shrink-0 w-[180px] snap-center my-1 ${
                            isSelected
                              ? "ring-2 ring-[hsl(var(--primary-500))] scale-[1.02]"
                              : "hover:shadow-lg hover:ring-2 hover:ring-gray-200"
                          }`}
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          {/* Package Image */}
                          {pkg.image || pkg.imageUrl ? (
                            <div className="relative w-full">
                              <div
                                className="relative w-[85%] h-[120px] mx-auto mt-1"
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
                                  src={pkg.image || pkg.imageUrl || "/placeholder.png"}
                                  alt={pkg.name}
                                  fill
                                  className="object-cover group-hover:brightness-110 transition-all duration-300"
                                  sizes="180px"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}

                          {/* Package Info */}
                          <div className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <h4 className="font-bold text-gray-800 text-xs truncate">
                                {pkg.name}
                              </h4>
                            </div>
                            <div className="mb-1">
                              <p className="font-bold text-[hsl(var(--primary-600))] text-base">
                                {isPartyBags ? (
                                  `£${roundMoney(pkg.price * partyBagsQuantity).toFixed(2)}`
                                ) : (
                                  `£${pkg.price}`
                                )}
                              </p>
                            </div>
                            <button
                              className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white transition-colors text-sm py-2 font-semibold rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPackageForModal(pkg)
                                setShowPackageModal(true)
                              }}
                            >
                              Details
                            </button>
                          </div>

                          {/* Deselect Button */}
                          {isSelected && (
                            <button
                              className="absolute top-1 left-1 bg-gray-500 hover:bg-red-500 text-white rounded-full p-1 shadow-md transition-all duration-200 opacity-80 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPackage(null)
                              }}
                              title="Deselect package"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="w-full text-center py-4 text-gray-600">
                      <p>Base price: £{supplier.price || supplier.priceFrom || 0}</p>
                    </div>
                  )}
                </div>

                {/* Scroll Indicator */}
                {packages.length > 1 && (
                  <div className="flex justify-center gap-1 mt-1">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          selectedPackage?.id === pkg.id
                            ? 'w-6 bg-[hsl(var(--primary-500))]'
                            : 'w-1 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Party Bags Quantity Selector */}
            {isPartyBags && selectedPackage && (
              <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Number of Party Bags</h4>
                  <p className="text-xs text-gray-600">
                    Pre-set to match your guest count ({partyDetails?.guestCount || 10}), adjust if needed
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Math.max(1, Number(partyBagsQuantity) - 1))}
                    className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                    disabled={Number(partyBagsQuantity) <= 1}
                  >
                    <span className="text-lg">−</span>
                  </Button>

                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">{partyBagsQuantity}</div>
                    <div className="text-xs text-gray-500">bags</div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Number(partyBagsQuantity) + 1)}
                    className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                </div>

                <div className="bg-white rounded p-3 border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Price per bag:</span>
                      <span className="font-medium text-gray-900">£{selectedPackage.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium text-gray-900">{partyBagsQuantity} bags</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 text-sm">Total:</span>
                        <span className="font-bold text-xl text-gray-900">
                          £{roundMoney(selectedPackage.price * Number(partyBagsQuantity)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Addons Section */}
            {hasAddons && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Popular Add-ons</h3>
                </div>
                <div className="space-y-3">
                  {addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-all"
                    >
                      <Checkbox
                        id={addon.id}
                        checked={selectedAddons.some(a => a.id === addon.id)}
                        onCheckedChange={() => toggleAddon(addon)}
                        className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))] mt-0.5 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={addon.id}
                          className="font-medium text-gray-900 cursor-pointer block"
                          onClick={() => toggleAddon(addon)}
                        >
                          {addon.name}
                        </label>
                        {addon.description && (
                          <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                        )}
                      </div>
                      <div className="font-semibold text-primary-600 text-lg flex-shrink-0">+£{addon.price}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Price Summary - Only show if not party bags (they have their own summary) */}
            {!isPartyBags && (
              <section className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 text-base">Price Summary</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{selectedPackage?.name || 'Base Package'}</span>
                    <span className="font-semibold text-gray-900">
                      £{selectedPackage?.price || supplier.price || supplier.priceFrom || 0}
                    </span>
                  </div>

                  {selectedAddons.map((addon) => (
                    <div key={addon.id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{addon.name}</span>
                      <span className="font-medium text-gray-900">£{addon.price}</span>
                    </div>
                  ))}

                  <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-gray-900">£{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-5 flex-shrink-0 bg-white">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleAddToCart(false)}
              disabled={isSending || !selectedPackage}
              variant="outline"
              className="flex-1 h-12 font-medium border-primary-500 text-primary-600 hover:bg-primary-50"
            >
              {isSending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Supplier</span>
                </div>
              )}
            </Button>

            <Button
              onClick={() => handleAddToCart(true)}
              disabled={isSending || !selectedPackage}
              className="flex-1 h-12 font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow-lg"
            >
              {isSending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Add & Pay Now</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Package Details Modal */}
      {showPackageModal && selectedPackageForModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => {
            setShowPackageModal(false)
            setSelectedPackageForModal(null)
          }}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full h-[85vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-48 sm:h-64 flex-shrink-0">
              <Image
                src={selectedPackageForModal.image || selectedPackageForModal.imageUrl || "/placeholder.png"}
                alt={selectedPackageForModal.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <button
                onClick={() => {
                  setShowPackageModal(false)
                  setSelectedPackageForModal(null)
                }}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white hover:bg-gray-100 rounded-full p-1.5 sm:p-2 shadow-md transition-colors z-10"
              >
                <X size={18} className="sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-10">
                <h2 className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg mb-2">
                  {selectedPackageForModal.name}
                </h2>
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">
                    £{selectedPackageForModal.price}
                  </span>
                  {selectedPackageForModal.duration && (
                    <div className="flex items-center text-white text-sm sm:text-base drop-shadow-md">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                      <span className="font-semibold">{selectedPackageForModal.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ minHeight: 0 }}>
              {selectedPackageForModal.features && selectedPackageForModal.features.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">What's Included</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedPackageForModal.features.map((item, i) => (
                      <span key={i} className="bg-[hsl(var(--primary-500))] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPackageForModal.description && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Package Details</h3>
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="whitespace-pre-line text-sm sm:text-base text-gray-700 leading-relaxed">
                      {selectedPackageForModal.description}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with CTA */}
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-white flex-shrink-0">
              <Button
                onClick={() => {
                  setSelectedPackage(selectedPackageForModal)
                  setShowPackageModal(false)
                  setSelectedPackageForModal(null)
                }}
                className={`w-full h-12 sm:h-14 font-bold text-base sm:text-lg rounded-xl transition-all ${
                  selectedPackage?.id === selectedPackageForModal.id
                    ? "bg-gray-200 hover:bg-green-600 text-white"
                    : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white shadow-lg"
                }`}
              >
                {selectedPackage?.id === selectedPackageForModal.id ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Package Selected
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Choose This Package
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

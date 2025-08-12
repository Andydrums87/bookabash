"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal"
import { Clock, Sparkles, Lock, Gift, ArrowRight } from 'lucide-react'

const PartyReadyModal = ({
  isOpen,
  onClose,
  totalCost = 485,
  depositAmount = 150,
  timeLeftMinutes = 120,

}) => {
  const [stage, setStage] = useState(1) // 1 = celebration, 2 = add-ons
  const [timeLeft, setTimeLeft] = useState(timeLeftMinutes)
  const [selectedExtras, setSelectedExtras] = useState([])

  // Reset stage when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStage(1)
      setSelectedExtras([])
    }
  }, [isOpen])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [isOpen, timeLeft])

  const formatTimeLeft = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins} minutes`
  }

  const availableExtras = [
    {
      id: 'party-bags',
      name: 'Premium Party Bags',
      description: 'Themed party bags with toys, sweets & surprises',
      price: 30,
      icon: <Gift className="w-6 h-6" />,
      popular: true
    },
    {
      id: 'premium-decorations', 
      name: 'Premium Decorations',
      description: 'Balloon arches, banners & table decorations',
      price: 40,
      icon: <Sparkles className="w-6 h-6" />,
      popular: false
    }
  ]

  const toggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const isSelected = prev.some(item => item.id === extra.id)
      if (isSelected) {
        return prev.filter(item => item.id !== extra.id)
      } else {
        return [...prev, extra]
      }
    })
  }

  const isExtraSelected = (extraId) => {
    return selectedExtras.some(item => item.id === extraId)
  }

  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0)
  const finalTotal = totalCost + extrasTotal
  const finalDeposit = depositAmount + extrasTotal

  const handleContinueToPayment = () => {
    setStage(2)
  }

  const handleProceedToPayment = () => {
    // Store the selected extras and pricing in localStorage or state management
    const paymentData = {
      selectedExtras,
      extrasTotal,
      finalTotal,
      depositAmount: finalDeposit
    }
    
    // Store for payment page to access
    localStorage.setItem('party_payment_data', JSON.stringify(paymentData))
    
    // Navigate to payment page
    window.location.href = '/payment/secure-party'
  }

  const handleSkipExtras = () => {
    // Store base payment data
    const paymentData = {
      selectedExtras: [],
      extrasTotal: 0,
      finalTotal: totalCost,
      depositAmount: depositAmount
    }
    
    localStorage.setItem('party_payment_data', JSON.stringify(paymentData))
    window.location.href = '/payment/secure-party'
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      theme="fun"
      showCloseButton={true}
    >
      {stage === 1 ? (
        // Stage 1: Celebration
        <>
          <ModalHeader 
            title="🎉 How Exciting!"
            subtitle="All your suppliers have confirmed"
            theme="fun"
            icon={<Sparkles className="w-8 h-8 text-white animate-pulse" />}
          />

          <ModalContent>
            <div className="text-center space-y-6">
              {/* Big celebration message */}
              <div className="space-y-3">
                <div className="text-6xl">🎊</div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Your party dream team is ready!
                </h3>
                <p className="text-gray-600">
                  Time to secure your bookings and make it official
                </p>
              </div>

              {/* Simple urgency */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                  <span className="text-amber-800 font-medium">
                    Secure your slots within {formatTimeLeft(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Simple pricing */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total party cost</span>
                  <span className="text-2xl font-bold text-gray-800">£{totalCost}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Secure with just £{depositAmount} deposit today
                </div>
              </div>
            </div>
          </ModalContent>

          <ModalFooter theme="fun">
            <div className="space-y-3">
              <Button
                onClick={handleContinueToPayment}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Continue to Payment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-2 border-white/50 text-gray-700 hover:bg-white/80"
              >
                I'll decide later
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  💫 Don't worry - you can add more suppliers anytime
                </p>
              </div>
            </div>
          </ModalFooter>
        </>
      ) : (
        // Stage 2: Add-ons
        <>
          <ModalHeader 
            title="Have you thought about these?"
            subtitle="Perfect your party with optional extras"
            theme="fun"
            icon={<Gift className="w-6 h-6 text-white" />}
          />

          <ModalContent>
            <div className="space-y-4">
              {/* Add-ons */}
              <div className="space-y-3">
                {availableExtras.map((extra) => (
                  <div
                    key={extra.id}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      isExtraSelected(extra.id)
                        ? 'border-primary-400 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    onClick={() => toggleExtra(extra)}
                  >
                    {extra.popular && (
                      <div className="absolute -top-2 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                        POPULAR
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isExtraSelected(extra.id) 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {extra.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{extra.name}</h4>
                        <p className="text-sm text-gray-600">{extra.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">+£{extra.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Updated total */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total to secure:</span>
                  <span className="font-bold text-primary-600">£{finalDeposit}</span>
                </div>
                {extrasTotal > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    Base £{depositAmount} + £{extrasTotal} extras
                  </div>
                )}
              </div>
            </div>
          </ModalContent>

          <ModalFooter theme="fun">
            <div className="space-y-3">
              <Button
                onClick={handleProceedToPayment}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-lg rounded-xl shadow-lg"
              >
                <Lock className="w-5 h-5 mr-2" />
                Secure My Party - £{finalDeposit}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSkipExtras}
                className="w-full border-2 border-white/50 text-gray-700 hover:bg-white/80"
              >
                Skip extras - Pay £{depositAmount}
              </Button>
            </div>
          </ModalFooter>
        </>
      )}
    </UniversalModal>
  )
}

export default PartyReadyModal
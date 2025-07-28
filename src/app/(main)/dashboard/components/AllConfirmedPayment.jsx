import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Star, 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  CreditCard,
  Lock,
  Gift,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function AllConfirmedPayment({ 
  partyDetails = {},
  confirmedSuppliers = [], // Should exclude einvites
  addons = [],
  totalCost = 0,
  depositAmount = 50,
  onProcessPayment,
  onModifyBooking
}) {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      await onProcessPayment({
        method: paymentMethod,
        amount: depositAmount,
        total: totalCost
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const remainingBalance = totalCost - depositAmount

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 All Suppliers Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Your party team is ready. Secure your booking now!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Party Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Party Details Card */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {partyDetails.childName}'s {partyDetails.theme} Party
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{partyDetails.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>Age {partyDetails.childAge}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{partyDetails.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{partyDetails.guestCount || '10-15'} guests</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmed Suppliers */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Confirmed Party Team
                </h3>
                <div className="space-y-4">
                  {confirmedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={supplier.image} 
                        alt={supplier.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirmed
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{supplier.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-current text-yellow-400" />
                              <span>{supplier.rating}</span>
                            </div>
                            <span>•</span>
                            <span className="capitalize">{supplier.category}</span>
                          </div>
                          <span className="font-semibold text-gray-900">£{supplier.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add-ons (if any) */}
            {addons.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Selected Add-ons
                  </h3>
                  <div className="space-y-3">
                    {addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Gift className="w-5 h-5 text-blue-600" />
                          <div>
                            <h5 className="font-medium text-gray-900">{addon.name}</h5>
                            <p className="text-sm text-gray-600">{addon.description}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">£{addon.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {/* Cost Breakdown */}
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Summary
                </h3>
                
                {/* Cost breakdown */}
                <div className="space-y-3 mb-4">
                  {confirmedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{supplier.category}</span>
                      <span className="text-gray-900">£{supplier.price}</span>
                    </div>
                  ))}
                  
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{addon.name}</span>
                      <span className="text-gray-900">£{addon.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Cost</span>
                    <span>£{totalCost}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Deposit required today</span>
                    <span>£{depositAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Remaining balance</span>
                    <span>£{remainingBalance}</span>
                  </div>
                </div>

                {/* Payment method selection */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <span>Credit/Debit Card</span>
                    </label>
                  </div>
                </div>

                {/* Security notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Booking Protection</span>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Full refund if suppliers cancel</li>
                    <li>• 48-hour booking guarantee</li>
                    <li>• Customer support included</li>
                  </ul>
                </div>

                {/* Payment button */}
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Lock className="w-5 h-5" />
                      <span>Pay £{depositAmount} to Secure Booking</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Secure payment powered by Stripe. Remaining balance due on party day.
                </p>

                {/* Modify booking option */}
                <Button 
                  variant="outline" 
                  onClick={onModifyBooking}
                  className="w-full mt-4"
                >
                  Modify Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
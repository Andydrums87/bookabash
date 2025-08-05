"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useContextualNavigation } from "@/hooks/useContextualNavigation"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Baby, 
  Utensils, 
  Gift,
  Heart,
  Sparkles,
  CheckCircle,
  XCircle,
  X,
  Mail,
  Phone,
  Info,
  Loader2
} from "lucide-react"

export default function AnimatedRSVPPage() {
  const params = useParams()
  const inviteId = params['invite-id'] || params.inviteId || params.id
  const [animationPhase, setAnimationPhase] = useState('envelope')
  const [showRSVPModal, setShowRSVPModal] = useState(false)
  const [showDiscountOffer, setShowDiscountOffer] = useState(false)
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false)
  const [confirmedRsvpData, setConfirmedRsvpData] = useState(null)
  const [inviteDetails, setInviteDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { navigateWithContext } = useContextualNavigation()
  const [rsvpData, setRsvpData] = useState({
    status: '',
    guestName: '',
    email: '',
    phone: '',
    guestCount: 1,
    childrenCount: 0,
    dietaryRequirements: '',
    message: ''
  })

  // Load invite data on mount
  useEffect(() => {
    if (inviteId) {
      loadInviteData()
    } else {
      setError('No invite ID provided')
      setLoading(false)
    }
  }, [inviteId])

  const loadInviteData = async () => {
    try {
      console.log('🔍 Loading invite data for ID:', inviteId)
      setLoading(true)
      setError(null)

      // Get the public invite from database
      const result = await partyDatabaseBackend.getPublicInvite(inviteId)
      
      console.log('📡 Backend result:', result)

      if (!result.success) {
        console.error('❌ Failed to load invite:', result.error)
        setError(result.error || 'Invite not found')
        setLoading(false)
        return
      }

      const invite = result.invite
      console.log('✅ Loaded invite:', invite)
      console.log('📋 Invite data structure:', {
        id: invite.id,
        theme: invite.theme,
        has_generated_image: !!invite.generated_image,
        has_invite_data: !!invite.invite_data,
        has_parties: !!invite.parties,
        invite_data_keys: invite.invite_data ? Object.keys(invite.invite_data) : 'null'
      })

      // Structure the invite details for the component
      const structuredInviteDetails = {
        id: invite.id,
        theme: invite.theme,
        generatedImage: invite.generated_image,
        image: invite.generated_image, // Fallback
        partyId: invite.invite_data?.partyId,
        inviteData: {
          childName: invite.parties?.child_name || invite.invite_data?.inviteData?.childName || 'Birthday Child',
          age: invite.parties?.child_age || invite.invite_data?.inviteData?.age || '',
          date: invite.parties?.party_date || invite.invite_data?.inviteData?.date || '',
          time: invite.parties?.party_time || invite.invite_data?.inviteData?.time || '',
          venue: invite.parties?.location || invite.invite_data?.inviteData?.venue || ''
        }
      }

      console.log('📋 Structured invite details:', structuredInviteDetails)
      console.log('🎯 Final invite data for display:', {
        childName: structuredInviteDetails.inviteData.childName,
        date: structuredInviteDetails.inviteData.date,
        time: structuredInviteDetails.inviteData.time,
        venue: structuredInviteDetails.inviteData.venue,
        hasImage: !!structuredInviteDetails.generatedImage
      })

      setInviteDetails(structuredInviteDetails)

      // Check if user already RSVP'd
      const rsvpKey = `rsvp-confirmed-${inviteId}`
      const existingRSVP = localStorage.getItem(rsvpKey)
      if (existingRSVP) {
        const rsvpData = JSON.parse(existingRSVP)
        setRsvpConfirmed(true)
        setConfirmedRsvpData(rsvpData)
        setAnimationPhase('final')
      }

      setLoading(false)

    } catch (error) {
      console.error('❌ Error loading invite data:', error)
      setError('Failed to load invitation')
      setLoading(false)
    }
  }

  // Animation sequence - only start after data is loaded
  useEffect(() => {
    if (!loading && !error && inviteDetails && !rsvpConfirmed) {
      const sequence = [
        { phase: 'envelope', duration: 1000 },
        { phase: 'opening', duration: 1500 },
        { phase: 'invite-out', duration: 2000 },
        { phase: 'transitioning', duration: 1000 },
        { phase: 'final', duration: 0 }
      ]

      let currentIndex = 0
      
      const runSequence = () => {
        if (currentIndex < sequence.length) {
          const currentStep = sequence[currentIndex]
          setAnimationPhase(currentStep.phase)
          
          if (currentStep.duration > 0) {
            setTimeout(() => {
              currentIndex++
              runSequence()
            }, currentStep.duration)
          }
        }
      }

      // Start after a brief delay
      setTimeout(runSequence, 500)
    }
  }, [loading, error, inviteDetails, rsvpConfirmed])

  const handleRSVP = (status) => {
    setRsvpData(prev => ({ ...prev, status }))
    setShowRSVPModal(true)
  }

  const submitRSVP = async () => {
    try {
      console.log('📝 Submitting RSVP:', rsvpData)
      
      // Submit to database
      const result = await partyDatabaseBackend.submitRSVP(inviteId, {
        guestName: rsvpData.guestName,
        guestEmail: rsvpData.email,
        guestPhone: rsvpData.phone,
        attendance: rsvpData.status,
        adultsCount: rsvpData.guestCount,
        childrenCount: rsvpData.childrenCount,
        dietaryRequirements: rsvpData.dietaryRequirements,
        message: rsvpData.message
      })

      if (result.success) {
        console.log('✅ RSVP submitted successfully')
        
        // Save locally and mark as confirmed
        setConfirmedRsvpData(rsvpData)
        setRsvpConfirmed(true)
        
        const rsvpKey = `rsvp-confirmed-${inviteId}`
        localStorage.setItem(rsvpKey, JSON.stringify(rsvpData))
        
        setShowRSVPModal(false)
        
        // Show discount offer after successful RSVP
        setTimeout(() => setShowDiscountOffer(true), 500)
      } else {
        console.error('❌ RSVP submission failed:', result.error)
        alert('Failed to submit RSVP. Please try again.')
      }

    } catch (error) {
      console.error('❌ Error submitting RSVP:', error)
      alert('Failed to submit RSVP. Please try again.')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden relative -mt-16 pt-16">
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Loading your invitation...</h2>
            <p className="text-gray-600">Just a moment while we prepare everything!</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden relative -mt-16 pt-16">
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900">Invitation Not Found</h2>
            <p className="text-gray-600">
              We couldn't find this invitation. It may have been removed or the link might be incorrect.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Fallback image if invite image is missing
  const defaultInviteImage = "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754388320/party-invites/seo3b2joo1omjdkdmjtw.png"
  const displayImage = inviteDetails?.generatedImage || inviteDetails?.image || defaultInviteImage

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden relative -mt-16 pt-16">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-4 h-4 bg-primary-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-primary-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-primary-200 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 right-1/3 w-5 h-5 bg-primary-500 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-primary-600 rounded-full animate-bounce opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-4 h-4 bg-primary-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '2.5s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 -mb-16">
        
        {/* Envelope and Invitation Animation Container */}
        {(animationPhase === 'envelope' || animationPhase === 'opening' || animationPhase === 'invite-out' || animationPhase === 'transitioning') && (
          <div className={`relative ${
            animationPhase === 'transitioning' ? 'transform -translate-y-16 opacity-0 scale-75' : ''
          } transition-all duration-1000 ease-out`}>
            
            {/* Envelope */}
            <div className={`transform transition-all duration-1000 ease-out ${
              animationPhase === 'envelope' ? 'scale-100 opacity-100' : 
              animationPhase === 'opening' ? 'scale-105 opacity-100' :
              'scale-110 opacity-30'
            }`}>
              
              {/* Envelope SVG */}
              <div className="relative">
                <svg 
                  width="400" 
                  height="280" 
                  viewBox="0 0 400 280" 
                  className="drop-shadow-2xl"
                >
                  <rect 
                    x="20" 
                    y="80" 
                    width="360" 
                    height="180" 
                    rx="8" 
                    fill="#f8f9fa" 
                    stroke="#e9ecef" 
                    strokeWidth="2"
                  />
                  
                  <path 
                    d="M20 80 L200 180 L380 80 L380 40 L200 20 L20 40 Z"
                    fill="hsl(var(--primary-400))"
                    stroke="hsl(var(--primary-500))"
                    strokeWidth="2"
                    className={`transform-origin-center transition-all duration-1500 ease-out ${
                      animationPhase === 'opening' || animationPhase === 'invite-out' || animationPhase === 'transitioning'
                        ? 'rotate-[-25deg] translate-y-[-10px]' 
                        : 'rotate-0'
                    }`}
                    style={{ transformOrigin: '200px 80px' }}
                  />
                  
                  <circle 
                    cx="200" 
                    cy="60" 
                    r="15" 
                    fill="hsl(var(--primary-600))" 
                    className={`transition-all duration-500 ${
                      animationPhase === 'opening' ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                    }`}
                  />
                  <path 
                    d="M200 55 L195 60 L200 65 L205 60 Z" 
                    fill="white" 
                    className={`transition-all duration-500 ${
                      animationPhase === 'opening' ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                    }`}
                  />
                </svg>

                {/* Magical sparkles around envelope */}
                <div className={`absolute -inset-8 ${animationPhase === 'envelope' || animationPhase === 'opening' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                  <div className="absolute top-4 left-8 text-primary-500 animate-ping">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="absolute top-8 right-12 text-primary-400 animate-pulse">
                    <Heart className="w-3 h-3" />
                  </div>
                  <div className="absolute bottom-8 left-12 text-primary-600 animate-bounce">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="absolute bottom-4 right-8 text-primary-500 animate-ping" style={{ animationDelay: '0.5s' }}>
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Invitation Card Coming Out */}
            <div className={`absolute inset-0 flex items-center justify-center transform transition-all duration-1000 ease-out ${
              animationPhase === 'envelope' ? 'translate-y-[100px] scale-75 opacity-0' :
              animationPhase === 'opening' ? 'translate-y-[50px] scale-85 opacity-50' :
              animationPhase === 'invite-out' ? 'translate-y-0 scale-100 opacity-100' :
              'translate-y-0 scale-100 opacity-0'
            }`}>
              
              <div className="relative group">
                <div className={`absolute -inset-4 bg-gradient-to-r from-[hsl(var(--primary-300))] via-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] rounded-3xl blur-lg transition-opacity duration-1000 animate-pulse ${
                  animationPhase === 'invite-out' ? 'opacity-40' : 'opacity-0'
                }`}></div>
                
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white transform hover:scale-105 transition-transform duration-500">
                  <img
                    src={displayImage}
                    alt="Party Invitation"
                    className="w-80 h-auto max-w-sm"
                    onError={(e) => {
                      console.log('🖼️ Image failed to load, using fallback')
                      e.target.src = defaultInviteImage
                    }}
                  />
                </div>

                <div className={`absolute -inset-4 ${animationPhase === 'invite-out' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
                  <div className="absolute -top-2 -right-2 text-primary-500 animate-spin">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 text-primary-400 animate-pulse">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="absolute top-1/2 -left-4 text-primary-600 animate-bounce">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="absolute top-1/2 -right-4 text-primary-500 animate-pulse" style={{ animationDelay: '0.3s' }}>
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RSVP Success State */}
        {rsvpConfirmed && confirmedRsvpData && (
          <div className="transform transition-all duration-1000 ease-out w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {confirmedRsvpData.status === 'yes' ? "You're All Set!" : "Thanks for Letting Us Know!"}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {confirmedRsvpData.status === 'yes' 
                  ? `We can't wait to celebrate with you, ${confirmedRsvpData.guestName}!`
                  : `Sorry you can't make it, ${confirmedRsvpData.guestName}. We'll miss you!`
                }
              </p>
            </div>

            {confirmedRsvpData.status === 'yes' ? (
              <div className="space-y-8">
                {/* Party Reminder Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/50">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    🗓️ Party Details Reminder
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2">
                      <Calendar className="w-8 h-8 mx-auto text-primary-500" />
                      <div className="font-semibold text-gray-900">{inviteDetails?.inviteData?.date || 'TBD'}</div>
                      <div className="text-gray-600">Date</div>
                    </div>
                    <div className="space-y-2">
                      <Clock className="w-8 h-8 mx-auto text-primary-600" />
                      <div className="font-semibold text-gray-900">{inviteDetails?.inviteData?.time || 'TBD'}</div>
                      <div className="text-gray-600">Time</div>
                    </div>
                    <div className="space-y-2">
                      <MapPin className="w-8 h-8 mx-auto text-primary-700" />
                      <div className="font-semibold text-gray-900">{inviteDetails?.inviteData?.venue || 'TBD'}</div>
                      <div className="text-gray-600">Location</div>
                    </div>
                  </div>
                </div>

                {/* Gift Registry CTA */}
                {inviteDetails?.partyId && (
                  <div className="bg-gradient-to-br from-white/60 to-primary-50/60 backdrop-blur-sm rounded-3xl p-8 border border-primary-200/40 text-center">
                    <div className="text-4xl mb-4">🎁</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Want to Bring a Gift?
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      Check out {inviteDetails.inviteData?.childName || 'the birthday child'}'s wishlist and claim the perfect gift!
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-medium px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
                      onClick={async () => {
                        // First try to find the actual gift registry for this party
                        try {
                          console.log('🔍 Looking for gift registry for party:', inviteDetails.partyId)
                          const registryResult = await partyDatabaseBackend.getPartyGiftRegistry(inviteDetails.partyId)
                          
                          if (registryResult.success && registryResult.registry) {
                            // Use the actual registry ID
                            console.log('✅ Found registry:', registryResult.registry.id)
                            navigateWithContext(`/gift-registry/${registryResult.registry.id}/preview`, 'rsvp')
                          } else {
                            // Fallback to the known working registry ID for now
                            console.log('⚠️ Registry not found, using fallback')
                            navigateWithContext(`/gift-registry/d8588236-6060-4501-9627-19b8f3c5b428/preview`, 'rsvp')
                          }
                        } catch (error) {
                          console.error('❌ Error finding registry:', error)
                          // Use the known working registry ID as fallback
                          navigateWithContext(`/gift-registry/d8588236-6060-4501-9627-19b8f3c5b428/preview`, 'rsvp')
                        }
                      }}
                    >
                      <Gift className="w-5 h-5 mr-3" />
                      View Gift Registry
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/50 text-center">
                <div className="text-4xl mb-4">😢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  We'll Miss You!
                </h3>
                <p className="text-gray-600 mb-6">
                  Thank you for letting us know. We hope to celebrate with you next time!
                </p>
                {confirmedRsvpData.message && (
                  <div className="bg-gray-50 rounded-2xl p-4 mt-4">
                    <p className="text-gray-700 italic">"{confirmedRsvpData.message}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Final Layout - Only show in final phase */}
        {animationPhase === 'final' && !rsvpConfirmed && inviteDetails && (
          <div className={`transform transition-all duration-1000 ease-out w-full max-w-7xl mx-auto ${
            animationPhase === 'final'
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-20 opacity-0 pointer-events-none'
          }`}>
            
            <div className="lg:flex lg:items-start lg:space-x-12 lg:min-h-screen lg:py-8">
              
              {/* Left Column - Invitation */}
              <div className="lg:w-1/2 lg:flex-shrink-0 flex justify-center lg:justify-end lg:pr-6">
                <div className="lg:sticky lg:top-8">
                  <div className="relative group">
                    <div className="absolute -inset-6 bg-gradient-to-r from-[hsl(var(--primary-300))] via-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] rounded-3xl blur-xl opacity-40 animate-pulse"></div>
                    
                    <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white transform hover:scale-105 transition-transform duration-500">
                      <img
                        src={displayImage}
                        alt="Party Invitation"
                        className="w-full h-auto max-w-md mx-auto"
                        onError={(e) => {
                          console.log('🖼️ Image failed to load, using fallback')
                          e.target.src = defaultInviteImage
                        }}
                      />
                    </div>

                    {/* Enhanced sparkles */}
                    <div className="absolute -inset-6">
                      <div className="absolute -top-4 -right-4 text-primary-500 animate-spin">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div className="absolute -bottom-4 -left-4 text-primary-400 animate-pulse">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div className="absolute top-1/2 -left-6 text-primary-600 animate-bounce">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="absolute top-1/2 -right-6 text-primary-500 animate-pulse" style={{ animationDelay: '0.3s' }}>
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Party Details Card */}
                  {/* <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 rounded-2xl mt-6">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                        📋 Party Details
                      </h3>
                      
                      <div className="space-y-4 text-gray-700">
                        <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                          <span className="font-medium">{inviteDetails.inviteData?.date || 'Date TBD'}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-primary-100 rounded-xl">
                          <Clock className="w-5 h-5 text-primary-600 flex-shrink-0" />
                          <span className="font-medium">{inviteDetails.inviteData?.time || 'Time TBD'}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-primary-200 rounded-xl">
                          <MapPin className="w-5 h-5 text-primary-700 flex-shrink-0" />
                          <span className="font-medium">{inviteDetails.inviteData?.venue || 'Venue TBD'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}
                </div>
              </div>

              {/* Right Column - RSVP Actions */}
              <div className="lg:w-1/2 space-y-8 lg:pl-6 mt-8 lg:mt-0">
                
                {/* RSVP Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 lg:max-w-none max-w-md mx-auto border border-white/50">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 text-center lg:text-left">
                    Will you be joining us? 🎉
                  </h3>
                  
                  <p className="text-gray-600 mb-8 text-center lg:text-left text-lg">
                    We can't wait to celebrate with you! Let us know if you'll be there.
                  </p>

                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    <Button
                      onClick={() => handleRSVP('yes')}
                      className="flex-1 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-5 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                    >
                      <CheckCircle className="w-6 h-6 mr-3" />
                      I'll be there! ✨
                    </Button>
                    
                    <Button
                      onClick={() => handleRSVP('no')}
                      variant="outline"
                      className="flex-1 border-2 border-[hsl(var(--primary-300))] text-gray-700 hover:bg-[hsl(var(--primary-50))] font-bold py-5 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                    >
                      <XCircle className="w-6 h-6 mr-3" />
                      Can't make it 😢
                    </Button>
                  </div>
                </div>

                {/* Gift Registry */}
                {inviteDetails?.partyId && (
                  <div className="bg-gradient-to-br from-white/60 to-primary-50/60 backdrop-blur-sm rounded-3xl p-8 lg:max-w-none max-w-md mx-auto border border-primary-200/40 mb-20 md:mb-0">
                    <div className="flex items-start space-x-5">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-200/80 to-primary-300/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <Gift className="w-8 h-8 text-primary-700" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          🎁 {inviteDetails.inviteData?.childName || 'Birthday Child'}'s Gift Registry
                        </h3>
                        <p className="text-gray-600 mb-5 text-lg leading-relaxed">
                          See what {inviteDetails.inviteData?.childName || 'the birthday child'} is hoping for and help make their party extra special!
                        </p>

                        <Button 
                          className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-medium px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
                          onClick={async () => {
                            // First try to find the actual gift registry for this party
                            try {
                              console.log('🔍 Looking for gift registry for party:', inviteDetails.partyId)
                              const registryResult = await partyDatabaseBackend.getPartyGiftRegistry(inviteDetails.partyId)
                              
                              if (registryResult.success && registryResult.registry) {
                                // Use the actual registry ID
                                console.log('✅ Found registry:', registryResult.registry.id)
                                navigateWithContext(`/gift-registry/${registryResult.registry.id}/preview`, 'rsvp')
                              } else {
                                // Fallback to the known working registry ID for now
                                console.log('⚠️ Registry not found, using fallback')
                                navigateWithContext(`/gift-registry/d8588236-6060-4501-9627-19b8f3c5b428/preview`, 'rsvp')
                              }
                            } catch (error) {
                              console.error('❌ Error finding registry:', error)
                              // Use the known working registry ID as fallback
                              navigateWithContext(`/gift-registry/d8588236-6060-4501-9627-19b8f3c5b428/preview`, 'rsvp')
                            }
                          }}
                        >
                          <Gift className="w-5 h-5 mr-3" />
                          View Gift Registry
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RSVP Modal */}
      {showRSVPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {rsvpData.status === 'yes' ? '🎉 Awesome!' : '😢 Sorry to miss you'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRSVPModal(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <Input
                    value={rsvpData.guestName}
                    onChange={(e) => setRsvpData(prev => ({ ...prev, guestName: e.target.value }))}
                    placeholder="Enter your name"
                    className="rounded-xl border-2 border-gray-200 focus:border-[hsl(var(--primary-400))]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={rsvpData.email}
                      onChange={(e) => setRsvpData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="rounded-xl border-2 border-gray-200 focus:border-[hsl(var(--primary-400))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={rsvpData.phone}
                      onChange={(e) => setRsvpData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                      className="rounded-xl border-2 border-gray-200 focus:border-[hsl(var(--primary-400))]"
                    />
                  </div>
                </div>

                {rsvpData.status === 'yes' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Users className="w-4 h-4 inline mr-1" />
                          Total Guests
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={rsvpData.guestCount}
                          onChange={(e) => setRsvpData(prev => ({ ...prev, guestCount: parseInt(e.target.value) || 1 }))}
                          className="rounded-xl border-2 border-gray-200 focus:border-[hsl(var(--primary-400))]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Baby className="w-4 h-4 inline mr-1" />
                          Children
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={rsvpData.childrenCount}
                          onChange={(e) => setRsvpData(prev => ({ ...prev, childrenCount: parseInt(e.target.value) || 0 }))}
                          className="rounded-xl border-2 border-gray-200 focus:border-[hsl(var(--primary-400))]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Utensils className="w-4 h-4 inline mr-1" />
                        Dietary Requirements
                      </label>
                      <Input
                        value={rsvpData.dietaryRequirements}
                        onChange={(e) => setRsvpData(prev => ({ ...prev, dietaryRequirements: e.target.value }))}
                        placeholder="Any allergies or dietary needs?"
                        className="rounded-xl border-2 border-gray-200 focus:border-[hsl(var(--primary-400))]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <Textarea
                    value={rsvpData.message}
                    onChange={(e) => setRsvpData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={rsvpData.status === 'yes' ? "Can't wait to celebrate! 🎉" : "Sorry I'll miss the fun!"}
                    rows={3}
                    className="rounded-xl border-2 border-gray-200 focus:border-[hsl(var(--primary-400))]"
                  />
                </div>

                <Button
                  onClick={submitRSVP}
                  disabled={!rsvpData.guestName}
                  className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-300 ${
                    rsvpData.status === 'yes'
                      ? 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))]'
                      : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                  }`}
                >
                  {rsvpData.status === 'yes' ? '🎉 Confirm Attendance' : '😢 Send Regrets'}
                </Button>

              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Discount Offer Modal */}
      {showDiscountOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
            
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 text-primary-500 animate-spin">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="absolute top-8 right-8 text-primary-400 animate-bounce">
                <Gift className="w-6 h-6" />
              </div>
              <div className="absolute bottom-8 left-8 text-primary-600 animate-pulse">
                <Heart className="w-5 h-5" />
              </div>
              <div className="absolute bottom-4 right-4 text-primary-500 animate-ping">
                <Sparkles className="w-7 h-7" />
              </div>
            </div>

            <CardContent className="p-8 text-center relative z-10">
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDiscountOffer(false)}
                className="absolute top-4 right-4 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="space-y-6">
                
                <div className="space-y-2">
                  <div className="text-6xl animate-bounce">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Thanks for RSVPing!
                  </h2>
                  <p className="text-gray-600">
                    Love what you see? Create your own magical party invitations!
                  </p>
                </div>

                <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] border-2 border-[hsl(var(--primary-200))] rounded-2xl p-6">
                  <div className="space-y-3">
                    <div className="text-primary-600 font-semibold text-sm uppercase tracking-wide">
                      Exclusive RSVP Offer
                    </div>
                    <div className="text-4xl font-bold text-primary-700">
                      10% OFF
                    </div>
                    <div className="text-gray-700 font-medium">
                      Your first party with PartySnap
                    </div>
                    <div className="text-sm text-gray-500">
                      Create stunning invitations, manage RSVPs, and more!
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-2">Use code:</div>
                  <div className="text-2xl font-bold text-gray-900 font-mono bg-white px-4 py-2 rounded-lg border">
                    RSVP10
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Valid for 30 days • One-time use
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
                    onClick={() => {
                      window.open('/create-party', '_blank')
                    }}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create My Party Now
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-2 border-[hsl(var(--primary-300))] text-primary-700 hover:bg-[hsl(var(--primary-50))] font-medium py-3 px-6 rounded-2xl"
                    onClick={() => setShowDiscountOffer(false)}
                  >
                    Maybe Later
                  </Button>
                </div>

                <div className="flex justify-center items-center space-x-4 text-xs text-gray-400 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Easy Setup</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>Beautiful Design</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Instant RSVPs</span>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
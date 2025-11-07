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
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"
import { supabase } from '@/lib/supabase'
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
  Loader2,
  Lock,
  Home
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
  const [hasSeenAnimation, setHasSeenAnimation] = useState(false)
  const { navigateWithContext } = useContextualNavigation()
  const [matchedGuest, setMatchedGuest] = useState(null) // NEW: Store matched guest from RSVP code
  const [partyId, setPartyId] = useState(null) // NEW: Store party ID for RSVP code flow
  const [guestLimit, setGuestLimit] = useState(null) // Party guest limit
  const [totalConfirmedGuests, setTotalConfirmedGuests] = useState(0) // Already confirmed guests
  const [rsvpData, setRsvpData] = useState({
    guestName: '',
    childName: '', // Add this line
    email: '',
    phone: '',
    status: '',
    guestCount: 2,
    childrenCount: 0, // Default to 0 (just the invited child)
    dietaryRequirements: '',
    message: ''
  })

  // Check animation and RSVP status on mount
  useEffect(() => {
    if (inviteId) {
      checkAnimationStatus()
      checkRSVPStatus()
      loadInviteData()
    } else {
      setError('No invite ID provided')
      setLoading(false)
    }
  }, [inviteId])

  const checkAnimationStatus = () => {
    const animationKey = `animation-seen-${inviteId}`
    const hasSeenBefore = localStorage.getItem(animationKey)
    if (hasSeenBefore) {
      setHasSeenAnimation(true)
      setAnimationPhase('final')
    }
  }

  const checkRSVPStatus = () => {
    const rsvpKey = `rsvp-confirmed-${inviteId}`
    const existingRSVP = localStorage.getItem(rsvpKey)
    if (existingRSVP) {
      const rsvpData = JSON.parse(existingRSVP)
      setRsvpConfirmed(true)
      setConfirmedRsvpData(rsvpData)
      setAnimationPhase('final')
    }
  }

  const markAnimationAsSeen = () => {
    const animationKey = `animation-seen-${inviteId}`
    localStorage.setItem(animationKey, 'true')
    setHasSeenAnimation(true)
  }

  // Load invite data on mount
  const loadInviteData = async () => {
    try {
      console.log('🔍 Loading invite data for ID:', inviteId)
      setLoading(true)
      setError(null)

      // Check if this looks like an RSVP code (8-char alphanumeric, no dashes or date)
      const looksLikeRSVPCode = inviteId &&
        inviteId.length === 8 &&
        /^[A-Z0-9]{8}$/.test(inviteId) &&
        !inviteId.includes('-')

      if (looksLikeRSVPCode) {
        console.log('🎟️ Detected RSVP code format, looking up guest via API...')

        // Call API route to look up RSVP code (uses admin client on server)
        const response = await fetch(`/api/invites/lookup-rsvp?code=${inviteId}`)
        const rsvpResult = await response.json()

        if (rsvpResult.success && rsvpResult.guest) {
          console.log('✅ Found guest via RSVP code:', rsvpResult.guest.childName)

          // Store matched guest and party info
          setMatchedGuest(rsvpResult.guest)
          setPartyId(rsvpResult.party.id)

          // Store guest limit info
          const partyGuestLimit = rsvpResult.party.guest_count || 10
          setGuestLimit(partyGuestLimit)

          // Calculate confirmed guests from guest list
          const guestList = rsvpResult.party.party_plan?.einvites?.guestList || []
          const confirmed = guestList.filter(g => g.rsvpStatus === 'yes').length
          setTotalConfirmedGuests(confirmed)

          // Pre-fill child's name in RSVP form
          setRsvpData(prev => ({
            ...prev,
            childName: rsvpResult.guest.childName
          }))

          // Use the invite details from the result
          setInviteDetails(rsvpResult.inviteDetails)
          setLoading(false)
          return
        } else {
          // RSVP code not found - show error instead of falling back
          console.error('❌ RSVP code not found:', inviteId)
          console.error('📱 User agent:', navigator.userAgent)
          console.error('🌐 URL:', window.location.href)
          setError('Invalid or expired RSVP link. Please check the link and try again.')
          setLoading(false)
          return
        }
      }

      // Regular invite lookup (by slug or ID)
      const result = await partyDatabaseBackend.getPublicInvite(inviteId)

      console.log('📡 Backend result:', result)

      if (!result.success) {
        console.error('❌ Failed to load invite:', result.error)
        setError(result.error || 'Invite not found')
        setLoading(false)
        return
      }

      const invite = result.invite


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
      setLoading(false)

    } catch (error) {
      console.error('❌ Error loading invite data:', error)
      setError('Failed to load invitation')
      setLoading(false)
    }
  }

  // Animation sequence - only start if animation hasn't been seen before
  useEffect(() => {
    if (!loading && !error && inviteDetails && !rsvpConfirmed && !hasSeenAnimation) {
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
          
          // Mark animation as seen when it completes
          if (currentStep.phase === 'final') {
            markAnimationAsSeen()
          }
          
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
  }, [loading, error, inviteDetails, rsvpConfirmed, hasSeenAnimation])

  const handleRSVP = (status) => {
    setRsvpData(prev => ({ ...prev, status }))
    setShowRSVPModal(true)
  }

  const submitRSVP = async () => {
    try {
      console.log('📝 Submitting RSVP:', rsvpData)
      console.log('📝 Child name being sent:', rsvpData.childName)

      // ✅ FIX: Use the actual invite ID from loaded data, not the URL param (which might be a slug)
      const actualInviteId = inviteDetails?.id || inviteId
      console.log('🎯 Using invite ID:', actualInviteId, '(from URL param:', inviteId, ')')

      // Submit to database via backend
      const result = await partyDatabaseBackend.submitRSVP(actualInviteId, {
        guestName: rsvpData.guestName,
        guestEmail: rsvpData.email,
        childName: rsvpData.childName,
        guestPhone: rsvpData.phone,
        attendance: rsvpData.status,
        adultsCount: rsvpData.guestCount,
        childrenCount: rsvpData.childrenCount,
        dietaryRequirements: rsvpData.dietaryRequirements,
        message: rsvpData.message,
        // Include RSVP code and party ID if this is a personalized link
        rsvpCode: matchedGuest?.rsvpCode,
        partyId: partyId
      })
  
      console.log('🔍 Backend result:', result)
      
      if (result.success) {
        console.log('✅ RSVP submitted successfully:', result)
        console.log('📦 Returned RSVP data:', result.rsvp)
        
        // Save locally and mark as confirmed
        setConfirmedRsvpData(rsvpData)
        setRsvpConfirmed(true)
        
        const rsvpKey = `rsvp-confirmed-${inviteId}`
        localStorage.setItem(rsvpKey, JSON.stringify(rsvpData))
        
        console.log('🔒 Closing RSVP modal')
        setShowRSVPModal(false)
        
        console.log('⏰ Setting timeout for discount offer')
        setTimeout(() => {
          console.log('💰 Showing discount offer')
          setShowDiscountOffer(true)
        }, 500)
      } else {
        console.error('❌ RSVP submission failed:', result.error)
        console.error('❌ Full error result:', result)
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        
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

        {/* Main Layout - Always show when in final phase */}
        {animationPhase === 'final' && inviteDetails && (
          <div className="transform transition-all duration-1000 ease-out w-full max-w-7xl mx-auto translate-y-0 opacity-100">
            
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

                
                  </div>
                </div>
              </div>

              {/* Right Column - RSVP Actions */}
              <div className="lg:w-1/2 space-y-8 lg:pl-6 mt-8 lg:mt-0">
                
                {/* RSVP Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl  lg:max-w-none max-w-md mx-auto border border-white/50">
                  {/* Check if user has already RSVP'd */}
                  {rsvpConfirmed && confirmedRsvpData ? (
                    /* Already RSVP'd - Show confirmation */
                    <div className="text-center">
                      <div className="text-4xl mb-4 mt-5">
                        {confirmedRsvpData.status === 'yes' ? '🎉' : '😢'}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {confirmedRsvpData.status === 'yes' 
                          ? 'You\'re Already Confirmed!' 
                          : 'Thanks for Your Response'
                        }
                      </h3>
                      
                      {confirmedRsvpData.status === 'yes' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                          <div className="flex items-center justify-center space-x-2 text-green-800 mb-2">
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-bold text-lg">
                              You're attending as {confirmedRsvpData.guestName}
                            </span>
                          </div>
                          <p className="text-green-700">
                            Party size: {confirmedRsvpData.guestCount} adults
                            {confirmedRsvpData.childrenCount > 0 && `, ${confirmedRsvpData.childrenCount} children`}
                          </p>
                          <p className="text-green-600 text-sm mt-2">
                            We can't wait to celebrate with you! 🎊
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                          <div className="flex items-center justify-center space-x-2 text-amber-800 mb-2">
                            <Info className="w-6 h-6" />
                            <span className="font-bold text-lg">
                              You won't be attending
                            </span>
                          </div>
                          <p className="text-amber-700">
                            Thanks for letting us know, {confirmedRsvpData.guestName}
                          </p>
                          <p className="text-amber-600 text-sm mt-2">
                            We'll miss you at the celebration! 💛
                          </p>
                        </div>
                      )}

                      {confirmedRsvpData.message && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <p className="text-gray-700 italic text-sm">
                            "{confirmedRsvpData.message}"
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 bg-gray-100 rounded-lg p-3">
                        <Lock className="w-4 h-4 inline mr-1" />
                        RSVP completed • Need changes? Contact the host directly
                      </div>

                      {/* Show party details reminder for attending guests */}
                      {/* {confirmedRsvpData.status === 'yes' && (
                        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mt-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-4">
                            🗓️ Party Details Reminder
                          </h4>
                          <div className="grid grid-cols-1 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-primary-500" />
                              <span><strong>Date:</strong> {inviteDetails?.inviteData?.date || 'TBD'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-primary-600" />
                              <span><strong>Time:</strong> {inviteDetails?.inviteData?.time || 'TBD'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-primary-700" />
                              <span><strong>Location:</strong> {inviteDetails?.inviteData?.venue || 'TBD'}</span>
                            </div>
                          </div>
                        </div>
                      )} */}
                    </div>
                  ) : (
                    /* No RSVP yet - Show buttons */
                    <>
                      <h3 className="text-3xl font-bold text-gray-900 mb-3 mt-20 text-center lg:text-left">
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
                    </>
                  )}
                </div>

                {/* Gift Registry - Always show */}
                {inviteDetails?.partyId && (
                  <div className="bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-50))] backdrop-blur-sm rounded-3xl p-8 lg:max-w-none max-w-md mx-auto border border-[hsl(var(--primary-200))] mb-20 md:mb-0">
                    <div className="flex items-start space-x-5">
                      <div className="flex-shrink-0">
                       
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {inviteDetails.inviteData?.childName || 'Birthday Child'}'s Gift Registry
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
{/* RSVP Modal - Updated with UniversalModal */}
{showRSVPModal && (
  <UniversalModal 
    isOpen={showRSVPModal} 
    onClose={() => setShowRSVPModal(false)}
    size="md"
    theme="fun"
  >
    <ModalHeader
      title={rsvpData.status === 'yes' ? '🎉 Awesome!' : '😢 Sorry to miss you'}
      subtitle={rsvpData.status === 'yes' ? "Let's get you signed up!" : "Thanks for letting us know"}
      theme="fun"
      icon={rsvpData.status === 'yes' ? 
        <CheckCircle className="w-6 h-6" /> : 
        <XCircle className="w-6 h-6" />
      }
    />

    <ModalContent>
      <div className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <Input
            value={rsvpData.guestName}
            onChange={(e) => setRsvpData(prev => ({ ...prev, guestName: e.target.value }))}
            placeholder="Enter your name"
            className="rounded-xl border-2 border-gray-200 bg-white focus:border-[hsl(var(--primary-400))]"
          />
        </div>
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Child's Name * {matchedGuest && <span className="text-primary-600 text-xs">(pre-filled for you)</span>}
  </label>
  <Input
    value={rsvpData.childName}
    onChange={(e) => setRsvpData(prev => ({ ...prev, childName: e.target.value }))}
    placeholder="Which child is invited?"
    className="rounded-xl border-2 border-gray-200 bg-white focus:border-[hsl(var(--primary-400))]"
    disabled={!!matchedGuest}
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
              className="rounded-xl border-2 bg-white border-gray-200 focus:border-[hsl(var(--primary-400))]"
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
              className="rounded-xl border-2 bg-white border-gray-200 focus:border-[hsl(var(--primary-400))]"
            />
          </div>
        </div>

        {rsvpData.status === 'yes' && (
          <>
            {/* Guest count section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Baby className="w-4 h-4 inline mr-1" />
                Additional Children/Siblings
              </label>
              <select
                value={rsvpData.childrenCount}
                onChange={(e) => setRsvpData(prev => ({
                  ...prev,
                  childrenCount: parseInt(e.target.value)
                }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[hsl(var(--primary-400))] focus:outline-none focus:ring-0 bg-white text-center font-medium"
              >
                {(() => {
                  // Calculate available spots (party limit - confirmed guests)
                  const availableSpots = guestLimit ? Math.max(0, guestLimit - totalConfirmedGuests) : 10
                  // Max siblings is available spots minus 1 (for the invited child)
                  const maxSiblings = Math.max(0, availableSpots - 1)
                  const maxOptions = Math.min(maxSiblings, 10) // Cap at 10 for reasonable dropdown

                  return Array.from({ length: maxOptions + 1 }, (_, i) => i).map(num => (
                    <option key={num} value={num}>
                      {num === 0 ? 'Just the invited child' :
                       num === 1 ? '+1 sibling' :
                       `+${num} siblings`}
                    </option>
                  ))
                })()}
              </select>
              {guestLimit && totalConfirmedGuests >= guestLimit && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Party is at capacity - no additional siblings can attend
                </p>
              )}
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
                className="rounded-xl border-2 bg-white border-gray-200 focus:border-[hsl(var(--primary-400))]"
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
            className="rounded-xl border-2 bg-white border-gray-200 focus:border-[hsl(var(--primary-400))]"
          />
        </div>

      </div>
    </ModalContent>

    <ModalFooter theme="fun">
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
    </ModalFooter>
  </UniversalModal>
)}


      {/* Discount Offer Modal */}
      {showDiscountOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
            
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
                  <h2 className="text-2xl font-bold text-gray-900">
                    Thanks for RSVPing! 🎉
                  </h2>
                  <p className="text-gray-600">
                    Love what you see? Get 10% off your first party!
                  </p>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-3 font-medium">Your Discount Code:</div>
                  <div className="text-3xl font-bold text-gray-900 font-mono bg-white px-6 py-4 rounded-lg border-2 border-primary-300 mb-3">
                    RSVP10
                  </div>
                  <div className="text-xs text-gray-500">
                    Valid for 30 days • 10% off your first party
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
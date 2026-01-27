"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Copy, Check, Gift, MessageCircle, Mail, Share2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function ReferFriend() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [availableCredit, setAvailableCredit] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Generate a short, memorable referral code from user ID (fallback)
  const generateReferralCode = (userId) => {
    const shortId = userId.replace(/-/g, '').substring(0, 8).toUpperCase()
    return `PARTY${shortId}`
  }

  // Fetch or create referral code when modal opens
  const fetchReferralCode = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Call the database function to get or create referral code
      const { data: code, error: codeError } = await supabase
        .rpc('get_or_create_referral_code', { p_user_id: user.id })

      if (codeError) {
        console.error('Error getting referral code:', codeError)
        // Fallback to client-side generation
        setReferralCode(generateReferralCode(user.id))
      } else {
        setReferralCode(code)
      }

      // Get available credit balance
      const { data: credit, error: creditError } = await supabase
        .rpc('get_available_credit', { p_user_id: user.id })

      if (!creditError && credit !== null) {
        setAvailableCredit(parseFloat(credit))
      }
    } catch (err) {
      console.error('Error fetching referral data:', err)
      // Fallback to client-side generation
      setReferralCode(generateReferralCode(user.id))
    } finally {
      setLoading(false)
    }
  }

  const referralLink = typeof window !== 'undefined' && referralCode
    ? `${window.location.origin}/?ref=${referralCode}`
    : ''

  const shareMessage = `Hey! I've been using PartySnap to plan amazing parties. Use my link to sign up and we'll both get £20 off our next party booking!`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareMessage}\n\n${referralLink}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Get £20 off your party with PartySnap!")
    const body = encodeURIComponent(`${shareMessage}\n\n${referralLink}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleSMSShare = () => {
    const text = encodeURIComponent(`${shareMessage} ${referralLink}`)
    // Use different SMS URL format for iOS vs Android
    const smsUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? `sms:&body=${text}`
      : `sms:?body=${text}`
    window.location.href = smsUrl
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PartySnap Referral',
          text: shareMessage,
          url: referralLink,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }
  }

  const handleInviteClick = async () => {
    // If user state hasn't loaded yet, try to get it now
    let currentUser = user
    if (!currentUser) {
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (freshUser) {
        setUser(freshUser)
        currentUser = freshUser
      }
    }

    if (!currentUser) {
      alert('Please sign in to get your referral link!')
      return
    }
    setIsModalOpen(true)
    fetchReferralCode()
  }

  return (
    <>
      <div className="relative h-[280px] rounded-xl bg-primary-400 hidden md:flex justify-center items-start gap-4 p-6 flex-col overflow-hidden">
        {/* Background pattern - behind content */}
        <img src="/Union.png" alt="" className="absolute top-0 right-0 h-30 z-0 opacity-50" />
        <img src="/circles-top.png" alt="" className="absolute bottom-[-10px] left-0 h-12 z-0 opacity-50" />

        {/* Content - on top */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-bold mb-2">Refer a friend <br />and get £20</h2>
          <p className="text-white/80 text-sm mb-4">Share with friends and you both save</p>
        </div>
        <button
          onClick={handleInviteClick}
          className="relative z-10 bg-white cursor-pointer w-full py-3 rounded-full hover:bg-[hsl(var(--primary-100))] transition-colors font-semibold text-gray-900"
        >
          Invite Friends
        </button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-0 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header with icon */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Gift className="w-8 h-8 text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Give £20, Get £20</h2>
                <p className="text-gray-500 mt-1">Share with friends and you both save</p>
              </div>

              {/* Available Credit Banner (if they have credit) */}
              {availableCredit > 0 && (
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100 mx-2">
                  <p className="text-sm text-green-700">
                    You have <span className="font-bold">£{availableCredit.toFixed(2)}</span> credit available
                  </p>
                </div>
              )}

              {/* Copy Link - Main action */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mx-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Your link</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{referralLink}</p>
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    className={`flex-shrink-0 px-4 ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-primary-500 hover:bg-primary-600'} text-white`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Share Buttons - Simplified */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">WhatsApp</span>
                </button>
                <button
                  onClick={handleEmailShare}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">Email</span>
                </button>
                <button
                  onClick={handleSMSShare}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">SMS</span>
                </button>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-600">More</span>
                  </button>
                )}
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-400 text-center">
                For bookings over £100. Credit expires after 12 months.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

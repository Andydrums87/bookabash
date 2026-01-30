"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Gift, Copy, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { MessageCircle, Mail, Share2 } from "lucide-react"

export default function ReferFriendBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState(null)
  const [availableCredit, setAvailableCredit] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const generateReferralCode = (userId) => {
    const shortId = userId.replace(/-/g, '').substring(0, 8).toUpperCase()
    return `PARTY${shortId}`
  }

  const fetchReferralCode = async () => {
    if (!user) return

    try {
      const { data: code, error: codeError } = await supabase
        .rpc('get_or_create_referral_code', { p_user_id: user.id })

      if (codeError) {
        setReferralCode(generateReferralCode(user.id))
      } else {
        setReferralCode(code)
      }

      const { data: credit, error: creditError } = await supabase
        .rpc('get_available_credit', { p_user_id: user.id })

      if (!creditError && credit !== null) {
        setAvailableCredit(parseFloat(credit))
      }
    } catch (err) {
      setReferralCode(generateReferralCode(user.id))
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

  const handleOpenModal = async () => {
    if (!user) {
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (freshUser) {
        setUser(freshUser)
      }
    }
    // Reset credit to ensure fresh fetch
    setAvailableCredit(0)
    setIsModalOpen(true)
    fetchReferralCode()
  }

  return (
    <>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-xl p-6 mt-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Give £20, Get £20</h3>
              <p className="text-white/80 text-sm">Refer friends and you both save on your next party</p>
            </div>
          </div>

          <Button
            onClick={handleOpenModal}
            className="bg-white hover:bg-gray-100 text-primary-600 font-semibold px-6 py-2 rounded-full cursor-pointer"
          >
            Share Your Link
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Modal - reusing same structure as ReferFriend component */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-0 shadow-2xl overflow-hidden">
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Give £20, Get £20</h2>
              <p className="text-gray-500 mt-1">Share with friends and you both save</p>
            </div>

            {availableCredit > 0 && (
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100 mx-2">
                <p className="text-sm text-green-700">
                  You have <span className="font-bold">£{availableCredit.toFixed(2)}</span> credit available
                </p>
              </div>
            )}

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

            <p className="text-xs text-gray-400 text-center">
              For bookings over £100. Credit expires after 12 months.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

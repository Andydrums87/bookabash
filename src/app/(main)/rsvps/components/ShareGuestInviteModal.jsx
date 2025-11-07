// ShareGuestInviteModal.jsx - Share individual guest invite via multiple channels
"use client"

import { useState } from 'react'
import { X, Copy, MessageCircle, Send, Mail, Smartphone, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getRSVPUrl } from '@/utils/generateRSVPCode'

export function ShareGuestInviteModal({ isOpen, onClose, guest, inviteData, onMarkAsSent }) {
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)

  if (!isOpen || !guest) return null

  const rsvpUrl = getRSVPUrl(guest.rsvpCode)

  // Create personalized message
  const personalizedMessage = inviteData?.whatsappText
    ? `${inviteData.whatsappText}\n\nRSVP for ${guest.childName}: ${rsvpUrl}`
    : `You're invited to our party! 🎉\n\nRSVP for ${guest.childName}: ${rsvpUrl}`

  // Share URLs
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(personalizedMessage)}`
  const smsUrl = `sms:?body=${encodeURIComponent(personalizedMessage)}`
  const emailSubject = inviteData?.title || `Party Invitation for ${guest.childName}`
  const emailBody = personalizedMessage
  const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(rsvpUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.log('Copy failed')
    }
  }

  const handleShare = async (platform) => {
    setSending(true)

    // Mark as sent after a short delay (simulating the action)
    setTimeout(() => {
      onMarkAsSent(guest.id, platform)
      setSending(false)
    }, 500)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: emailSubject,
          text: personalizedMessage,
          url: rsvpUrl,
        })
        handleShare('native')
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Send Invite</h3>
                <p className="text-sm text-gray-600 mt-1">
                  For {guest.childName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Personalized URL */}
            <div className="bg-primary-50 rounded-lg border border-primary-200 p-4 mb-6">
              <label className="text-xs font-medium text-gray-600 block mb-2">
                Personal Invite Link
              </label>
              <div className="flex items-center gap-2">
                <code className="text-sm text-gray-800 flex-1 truncate font-mono bg-white px-3 py-2 rounded border">
                  {rsvpUrl}
                </code>
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Primary Action: WhatsApp (Default) */}
            <div className="mb-4">
              <Button
                asChild
                onClick={() => handleShare('whatsapp')}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
                disabled={sending}
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {sending ? 'Sending...' : 'Send via WhatsApp'}
                </a>
              </Button>
            </div>

            {/* Other Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 text-center mb-3">
                Or share via:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Email */}
                <Button
                  asChild
                  onClick={() => handleShare('email')}
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <a href={emailUrl}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                </Button>

                {/* SMS */}
                <Button
                  asChild
                  onClick={() => handleShare('sms')}
                  variant="outline"
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                >
                  <a href={smsUrl}>
                    <Smartphone className="w-4 h-4 mr-2" />
                    SMS
                  </a>
                </Button>

                {/* Telegram */}
                <Button
                  asChild
                  onClick={() => handleShare('telegram')}
                  variant="outline"
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200"
                >
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(rsvpUrl)}&text=${encodeURIComponent(personalizedMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Telegram
                  </a>
                </Button>

                {/* Native Share (Mobile) */}
                {navigator?.share && (
                  <Button
                    onClick={handleNativeShare}
                    variant="outline"
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    More...
                  </Button>
                )}

                {/* Copy Link */}
                {!navigator?.share && (
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                💡 This unique link is just for {guest.childName}. Their RSVP will be automatically matched!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

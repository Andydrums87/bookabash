"use client"

import { useState } from "react"
import { MessageCircle, Mail, Phone, ChevronRight, HelpCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SupportWidget() {
  const [isExpanded, setIsExpanded] = useState(false)

  const supportEmail = "hello@partysnap.co.uk"

  const handleEmailClick = () => {
    window.location.href = `mailto:${supportEmail}?subject=Help with my party booking`
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi! I need help with my party booking on PartySnap.")
    window.open(`https://wa.me/447835444903?text=${message}`, '_blank')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-gray-900">Need Help?</h3>
            <p className="text-xs text-gray-500">We're here for you</p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600 mb-4">
            Got questions about your party? Our friendly team is ready to help!
          </p>

          {/* Response time badge */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Usually responds within 2 hours</span>
          </div>

          {/* Contact options */}
          <div className="space-y-2">
            {/* WhatsApp - Primary */}
            <Button
              onClick={handleWhatsAppClick}
              className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </Button>

            {/* Email */}
            <Button
              onClick={handleEmailClick}
              variant="outline"
              className="w-full h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send us an email
            </Button>
          </div>

          {/* Email display */}
          <p className="text-xs text-center text-gray-400 mt-3">
            {supportEmail}
          </p>
        </div>
      )}
    </div>
  )
}

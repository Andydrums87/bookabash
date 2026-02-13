"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User, Phone, Mail, Info } from "lucide-react"

// Check if email is an Apple private relay email
const isApplePrivateRelayEmail = (email) => {
  return email?.includes('@privaterelay.appleid.com')
}

export default function ContactInformationForm({
  formData = {},
  user = null,
  customerProfile = null,
  onInputChange = () => {}
}) {
  const isPrivateRelay = isApplePrivateRelayEmail(formData.email)
  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Contact Information</h2>
              <p className="text-gray-600 text-sm">How suppliers will reach you</p>
            </div>
          </div>
          {customerProfile && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
              ✅ Auto-filled
            </div>
          )}
          {!user && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              💡 Sign in to auto-fill
            </div>
          )}
        </div>

        {!user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Sign in to auto-fill your details</p>
                <p className="text-xs text-blue-700 mt-1">
                  We'll automatically populate your contact information from your profile
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Parent/Guardian Name {user && <span className="text-red-500">*</span>}
              </label>
              <Input
                placeholder={user ? "Your full name" : "Will be filled after sign-in"}
                value={formData.parentName}
                onChange={(e) => onInputChange("parentName", e.target.value)}
                className="bg-white border-gray-200 focus:border-primary-500 h-12 text-base"
                disabled={!user && !formData.parentName}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number {user && <span className="text-red-500">*</span>}
              </label>
              <Input
                placeholder={user ? "07xxx xxx xxx" : "Will be filled after sign-in"}
                value={formData.phoneNumber}
                onChange={(e) => onInputChange("phoneNumber", e.target.value)}
                className="bg-white border-gray-200 focus:border-primary-500 h-12 text-base"
                disabled={!user && !formData.phoneNumber}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address {user && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="email"
              placeholder={user ? "your.email@example.com" : "Will be filled after sign-in"}
              value={isPrivateRelay ? (formData.email === customerProfile?.email ? '' : formData.email) : formData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              className="bg-white border-gray-200 focus:border-primary-500 h-12 text-base"
              disabled={!user && !formData.email}
            />
            {isPrivateRelay && (
              <p className="text-xs text-amber-600 mt-1 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                You signed in with Apple's private email. Please enter your contact email so suppliers can reach you.
              </p>
            )}
            {!isPrivateRelay && !user && (
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                Sign in first and we'll auto-fill your contact details
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
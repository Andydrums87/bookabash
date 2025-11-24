"use client"

import { Mail, Lock, User, Phone, Bell, Check } from "lucide-react"

export default function AccountCreationStep({ accountData, onChange }) {
  const updateField = (field, value) => {
    onChange({
      ...accountData,
      [field]: value
    })
  }

  const toggleNotification = (field) => {
    const notifications = accountData.notifications || {}
    onChange({
      ...accountData,
      notifications: {
        ...notifications,
        [field]: !notifications[field]
      }
    })
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const passwordsMatch = accountData.password && accountData.confirmPassword &&
    accountData.password === accountData.confirmPassword

  const isPasswordValid = accountData.password && accountData.password.length >= 6

  return (
    <div className="py-12 max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        Create your account
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        Let's get you set up with your supplier account.
      </p>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Your Full Name
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={accountData.fullName || ""}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="John Smith"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={accountData.email || ""}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="john@example.com"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
          {accountData.email && !isValidEmail(accountData.email) && (
            <p className="text-sm text-red-600 mt-2">Please enter a valid email address</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={accountData.password || ""}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
          {accountData.password && !isPasswordValid && (
            <p className="text-sm text-red-600 mt-2">Password must be at least 6 characters</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={accountData.confirmPassword || ""}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Re-enter your password"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
          {accountData.confirmPassword && !passwordsMatch && (
            <p className="text-sm text-red-600 mt-2">Passwords do not match</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={accountData.phone || ""}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="07123 456789"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
            />
          </div>

          {/* SMS Notifications - Simple inline */}
          <div className="mt-3 flex items-start gap-3">
            <input
              type="checkbox"
              id="smsNotifications"
              checked={accountData.notifications?.smsBookings ?? true}
              onChange={(e) => toggleNotification('smsBookings')}
              className="w-4 h-4 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <label htmlFor="smsNotifications" className="text-sm text-gray-700">
              Send me SMS alerts for new enquiries <span className="text-gray-500">(recommended - respond faster, win more bookings)</span>
            </label>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="terms"
            checked={accountData.agreedToTerms || false}
            onChange={(e) => updateField('agreedToTerms', e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{" "}
            <a href="/terms" className="underline hover:text-gray-900" target="_blank" rel="noopener noreferrer">
              Terms & Conditions
            </a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:text-gray-900" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>
    </div>
  )
}

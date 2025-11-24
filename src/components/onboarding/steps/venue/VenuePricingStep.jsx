"use client"

import { PoundSterling } from "lucide-react"

export default function VenuePricingStep({ pricing, onChange }) {
  const updatePricing = (field, value) => {
    onChange({
      ...pricing,
      [field]: value
    })
  }

  return (
    <div className="py-12 max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        Set your pricing
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        You can always change this later. We'll help you set competitive rates.
      </p>

      <div className="space-y-8">
        {/* Hourly Rate */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Hourly Rate
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <PoundSterling className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="number"
              min="0"
              value={pricing.hourlyRate || ""}
              onChange={(e) => updatePricing('hourlyRate', parseInt(e.target.value) || 0)}
              placeholder="50"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Your base rate per hour for venue hire</p>
        </div>

        {/* Minimum Booking Hours */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Minimum Booking Hours
          </label>
          <select
            value={pricing.minimumBookingHours || 4}
            onChange={(e) => updatePricing('minimumBookingHours', parseInt(e.target.value))}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
          >
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
            <option value="4">4 hours (recommended)</option>
            <option value="5">5 hours</option>
            <option value="6">6 hours</option>
            <option value="8">8 hours (full day)</option>
          </select>
          <p className="text-sm text-gray-600 mt-2">Most venues require 3-4 hours minimum</p>
        </div>

        {/* Cleaning/Security Deposit (Optional) */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Security Deposit (Optional)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <PoundSterling className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="number"
              min="0"
              value={pricing.securityDeposit || ""}
              onChange={(e) => updatePricing('securityDeposit', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Refundable deposit (leave blank if none)</p>
        </div>

        {/* Setup and Cleanup Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Setup & Cleanup Time</h4>
          <p className="text-sm text-blue-800">
            Standard 1 hour setup and 1 hour cleanup included with all bookings.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            This ensures adequate time for proper party preparation and venue restoration.
          </p>
        </div>

        {/* Pricing Preview */}
        {pricing.hourlyRate > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Pricing Example</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {pricing.minimumBookingHours || 4} hours @ £{pricing.hourlyRate}/hour
                </span>
                <span className="font-medium">
                  £{pricing.hourlyRate * (pricing.minimumBookingHours || 4)}
                </span>
              </div>
              {pricing.securityDeposit > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Security deposit</span>
                  <span className="font-medium">£{pricing.securityDeposit}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Total for {pricing.minimumBookingHours || 4} hours</span>
                <span className="font-semibold text-lg">
                  £{pricing.hourlyRate * (pricing.minimumBookingHours || 4) + (pricing.securityDeposit || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

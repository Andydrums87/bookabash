"use client"

import { useState, useEffect } from "react"
import { X, Check, Loader2 } from "lucide-react"

export default function CheckAvailabilityModal({
  isOpen,
  onClose,
  partyDetails,
  suppliers,
  totalCost,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    partyDate: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Pre-fill party date and name from party details
  useEffect(() => {
    if (isOpen && partyDetails) {
      setFormData((prev) => ({
        ...prev,
        partyDate: partyDetails.date || prev.partyDate,
        name: partyDetails.childName
          ? `${partyDetails.childName}'s parent`
          : prev.name,
      }))
    }
  }, [isOpen, partyDetails])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false)
      setError(null)
    }
  }, [isOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) return

    setIsSubmitting(true)
    setError(null)

    try {
      const sessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("tracking_session_id")
          : null

      const res = await fetch("/api/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          partyDate: formData.partyDate,
          notes: formData.notes,
          sessionId,
          partyDetails,
          suppliers: suppliers
            ? Object.fromEntries(
                Object.entries(suppliers)
                  .filter(([_, s]) => s)
                  .map(([type, s]) => [
                    type,
                    { name: s.name, price: s.price, category: s.category },
                  ])
              )
            : {},
          totalCost,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Something went wrong")
      }

      setIsSuccess(true)
    } catch (err) {
      console.error("Check availability error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          /* Success state */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              We're on it!
            </h3>
            <p className="text-gray-600 mb-6">
              We're checking availability with your selected suppliers and will
              be in touch shortly.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Back to my plan
            </button>
          </div>
        ) : (
          /* Form state */
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  We'll check everything for you
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  We'll confirm availability with your selected suppliers and
                  get back to you shortly.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 ml-4 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="07XXX XXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party date
                </label>
                <input
                  type="date"
                  value={formData.partyDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      partyDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anything else we should know?{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="E.g. specific requirements, questions..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.name ||
                  !formData.email ||
                  !formData.phone
                }
                className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Check availability"
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                No payment needed. We'll be in touch to confirm everything.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

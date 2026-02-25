"use client"
import { ShieldCheck, Eye, CreditCard, CheckCircle, Clock } from "lucide-react"

export default function TrustIndicators() {
  return (
    <section className="bg-white py-6 md:py-10 border-b border-[hsl(var(--primary-100))]">
      <div className="container mx-auto px-4">
        {/* Main headline */}
        <p className="text-center text-gray-800 text-lg md:text-xl font-semibold mb-6">
          See your full party plan before you pay.
        </p>

        {/* Trust points - Row 1 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 mb-4">
          {/* No commitment */}
          <div className="flex items-center gap-2 text-gray-600">
            <Eye className="w-5 h-5 text-[hsl(var(--primary-500))]" />
            <span className="text-sm md:text-base">
              <span className="font-medium text-gray-900">No commitment</span> — browse your plan freely
            </span>
          </div>

          {/* No payment upfront */}
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="w-5 h-5 text-[hsl(var(--primary-500))]" />
            <span className="text-sm md:text-base">
              <span className="font-medium text-gray-900">No payment</span> until you're ready
            </span>
          </div>

          {/* Money back guarantee */}
          <div className="flex items-center gap-2 text-gray-600">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm md:text-base">
              <span className="font-medium text-gray-900">100% money-back</span> guarantee
            </span>
          </div>
        </div>

        {/* Trust points - Row 2: Manual Confirmation */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
          {/* Personally confirmed */}
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm md:text-base">
              <span className="font-medium text-gray-900">Personally confirmed</span> with every supplier
            </span>
          </div>

          {/* Confirmation pack */}
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5 text-[hsl(var(--primary-500))]" />
            <span className="text-sm md:text-base">
              <span className="font-medium text-gray-900">Full confirmation pack</span> within 2 working days
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

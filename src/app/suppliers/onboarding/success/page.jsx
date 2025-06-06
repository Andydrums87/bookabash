"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SupplierOnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="h-10 w-auto relative">
                <Image src="/images/logo.png" alt="BookABash" width={150} height={40} className="object-contain" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Complete!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for joining BookABash! Your account has been created and is ready to use.
            </p>

            <div className="space-y-4">
              <Button className="w-full" asChild>
                <Link href="/suppliers/dashboard">Go to Your Dashboard</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
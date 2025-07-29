'use client'

import { Suspense } from 'react'
import AuthCallback from "../components/AuthCallback"

export const dynamic = 'force-dynamic'

// Loading component for the suspense fallback
function AuthCallbackLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 mb-4">
          Welcome to ParySnap! 🎉
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
          Setting up your account...
        </p>
        {/* Loading animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallback />
    </Suspense>
  )
}
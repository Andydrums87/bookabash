"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/UniversalModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function RecoverPartyModal({ isOpen, onClose }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/recover-party-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })

      const result = await response.json()

      if (result.success && result.data) {
        // Populate localStorage with recovered party data
        if (result.data.partyDetails) {
          localStorage.setItem('party_details', JSON.stringify(result.data.partyDetails))
        }
        if (result.data.partyPlan) {
          localStorage.setItem('user_party_plan', JSON.stringify(result.data.partyPlan))
        }
        // Store the email for checkout pre-fill
        localStorage.setItem('saved_party_email', email.trim().toLowerCase())

        setStatus('success')

        // Redirect to dashboard after short delay
        setTimeout(() => {
          onClose()
          router.push('/dashboard')
        }, 1500)
      } else {
        setStatus('error')
        setErrorMessage(result.error || 'No saved party found for this email')
      }
    } catch (error) {
      console.error('Error recovering party:', error)
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  const handleClose = () => {
    // Reset state when closing
    setEmail('')
    setStatus('idle')
    setErrorMessage('')
    onClose()
  }

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      theme="fun"
    >
      <ModalHeader
        title="Recover Your Party Plan"
        subtitle="Enter the email you used when saving your party"
        theme="fun"
        icon={<Download className="w-6 h-6" />}
      />

      <form onSubmit={handleSubmit}>
        <ModalContent className="space-y-4">
          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-medium text-green-800">Party plan recovered!</p>
              <p className="text-sm text-green-600 mt-1">
                Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="recover-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="recover-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    className="pl-10"
                    disabled={status === 'loading'}
                    autoFocus
                  />
                </div>
              </div>

              {status === 'error' && errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <p className="text-sm text-gray-500">
                We'll look up your saved party plan and restore it so you can continue planning.
              </p>
            </>
          )}
        </ModalContent>

        {status !== 'success' && (
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={status === 'loading'}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={status === 'loading' || !email}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Recover Party Plan
                </>
              )}
            </Button>
          </ModalFooter>
        )}
      </form>
    </UniversalModal>
  )
}

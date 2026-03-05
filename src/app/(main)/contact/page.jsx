"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus({ type: '', message: '' })

    const trimmedFirstName = formData.firstName.trim()
    const trimmedLastName = formData.lastName.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedMessage = formData.message.trim()

    if (!trimmedFirstName) {
      setSubmitStatus({ type: 'error', message: 'Please enter your first name.' })
      return
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    if (!trimmedMessage) {
      setSubmitStatus({ type: 'error', message: 'Please enter a message.' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/email/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${trimmedFirstName} ${trimmedLastName}`.trim(),
          email: trimmedEmail,
          inquiryType: 'general',
          subject: 'Contact Form Submission',
          message: trimmedMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSubmitStatus({
        type: 'success',
        message: "Thank you for your message! We'll get back to you within 24 hours."
      })
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      })
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Something went wrong. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

              {/* Left Side - Heading & Contact Info */}
              <div className="lg:sticky lg:top-32">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Get in —<br />
                  touch with us
                </h1>

                <p className="text-gray-600 text-lg mb-10 max-w-md">
                  We're here to help! Whether you have a question about our services, need assistance with your party, or want to provide feedback, our team is ready to assist you.
                </p>

                {/* Email */}
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">Email:</p>
                  <a
                    href="mailto:hello@partysnap.co.uk"
                    className="text-xl md:text-2xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    hello@partysnap.co.uk
                  </a>
                </div>

                {/* Phone */}
                <div className="mb-8">
                  <p className="text-gray-500 text-sm mb-1">Phone:</p>
                  <a
                    href="tel:+447405243293"
                    className="text-xl md:text-2xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    +44 7405 243293
                  </a>
                  <p className="text-gray-500 text-sm mt-1">Available Monday to Friday, 9 AM - 6 PM GMT</p>
                </div>

                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/447405243293"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  WhatsApp Us
                  <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-900" />
                  </span>
                </a>
              </div>

              {/* Right Side - Form */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Status Message */}
                  {submitStatus.message && (
                    <div className={`p-4 rounded-xl ${
                      submitStatus.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {submitStatus.message}
                    </div>
                  )}

                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder-gray-400"
                        placeholder="Enter your first name..."
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder-gray-400"
                        placeholder="Enter your last name..."
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder-gray-400"
                      placeholder="Enter your email address..."
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      How can we help you?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Enter your message..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-gray-900" />
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

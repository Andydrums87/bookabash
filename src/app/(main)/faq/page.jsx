"use client"

import { useState } from "react"
import { ChevronRight, Search } from "lucide-react"
import Image from "next/image"

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openFAQs, setOpenFAQs] = useState(new Set())

  const toggleFAQ = (id) => {
    const newOpenFAQs = new Set(openFAQs)
    if (newOpenFAQs.has(id)) {
      newOpenFAQs.delete(id)
    } else {
      newOpenFAQs.add(id)
    }
    setOpenFAQs(newOpenFAQs)
  }

  const faqs = [
    {
      id: 1,
      question: "How far in advance should I book?",
      answer: "We recommend booking 2-4 weeks in advance for the best supplier availability. However, we often accommodate last-minute bookings depending on supplier availability in your area."
    },
    {
      id: 2,
      question: "What areas do you cover?",
      answer: "We currently cover most of England, with strongest coverage in London and the South East. Our network is rapidly expanding. Enter your postcode on our platform to see available suppliers in your area."
    },
    {
      id: 3,
      question: "How much does PartySnap cost?",
      answer: "PartySnap is completely free to use! You only pay the suppliers directly for their services. We don't add any platform fees or hidden charges."
    },
    {
      id: 4,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and Apple Pay. All payments are processed securely through Stripe."
    },
    {
      id: 5,
      question: "Can I change or cancel my booking?",
      answer: "Yes! You can modify your booking up to 7 days before your party date without any fees. Cancellations made more than 7 days in advance receive a full refund."
    },
    {
      id: 6,
      question: "What if a supplier doesn't show up?",
      answer: "This is extremely rare due to our vetting process, but if it happens, we have emergency backup suppliers and will do everything possible to save your party. If we can't provide a suitable replacement, you'll receive a full refund."
    },
    {
      id: 7,
      question: "How do you vet your suppliers?",
      answer: "Every supplier goes through our verification process including background checks, insurance verification, and portfolio review. Only suppliers who consistently deliver excellent service remain in our network."
    },
    {
      id: 8,
      question: "Can I book multiple suppliers for one party?",
      answer: "Absolutely! Most parties benefit from multiple suppliers - entertainers, decorators, catering, etc. Our platform makes it easy to coordinate everything in one place."
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-[hsl(var(--primary-400))] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752828017/iStock-1149320278_srn8ti-removebg-preview_njfbhn.png"
            alt="Help Center"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              How can we help you?
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-8">
              Welcome to our Help Center! Here, you'll find answers to frequently asked questions, helpful guides, and useful tips to assist you in getting the most out of our platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
              {/* Left Side - Title */}
              <div className="lg:col-span-1">
                <p className="text-sm font-medium text-gray-500 mb-2">Support</p>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">FAQs</h2>
                <p className="text-gray-600 leading-relaxed">
                  Have questions? We've got answers! Check out our Frequently Asked Questions (FAQs) to find quick solutions to common queries. Save time and get the information you need right here.
                </p>
              </div>

              {/* Right Side - FAQ List */}
              <div className="lg:col-span-2">
                <div className="divide-y divide-gray-200">
                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No results found. Try a different search term.</p>
                    </div>
                  ) : (
                    filteredFAQs.map(faq => (
                      <div key={faq.id} className="py-5">
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full text-left flex items-center justify-between group"
                        >
                          <h3 className="text-base md:text-lg font-medium text-gray-900 pr-4 group-hover:text-primary-600 transition-colors">
                            {faq.question}
                          </h3>
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                              openFAQs.has(faq.id) ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {openFAQs.has(faq.id) && (
                          <div className="mt-3 pr-10">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

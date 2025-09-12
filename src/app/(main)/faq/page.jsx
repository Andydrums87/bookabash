"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search, HelpCircle, Calendar, CreditCard, Users, MapPin, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
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

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'booking', label: 'Booking & Planning', icon: Calendar },
    { id: 'payment', label: 'Payments & Pricing', icon: CreditCard },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'coverage', label: 'Coverage & Delivery', icon: MapPin },
    { id: 'support', label: 'Support & Guarantees', icon: Shield },
    { id: 'account', label: 'Account & Platform', icon: Clock }
  ]

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: "How far in advance should I book my party?",
      answer: "We recommend booking 2-4 weeks in advance for the best supplier availability and to ensure you get your preferred date and time. However, we often accommodate last-minute bookings (even 48 hours ahead) depending on supplier availability in your area."
    },
    {
      id: 2,
      category: 'booking',
      question: "Can I change or cancel my booking?",
      answer: "Yes! You can modify your booking up to 7 days before your party date without any fees. Cancellations made more than 7 days in advance receive a full refund. Within 7 days, cancellation fees may apply depending on supplier policies, but we'll work with you to find the best solution."
    },
    {
      id: 3,
      category: 'payment',
      question: "How much does PartySnap cost?",
      answer: "PartySnap is completely free to use! You only pay the suppliers directly for their services. We don't add any platform fees or hidden charges. Our revenue comes from partnerships with suppliers, so the prices you see are the same as booking directly."
    },
    {
      id: 4,
      category: 'payment',
      question: "When do I need to pay?",
      answer: "Payment timing varies by supplier. Most require a deposit (typically 25-50%) when booking, with the balance due on the day of your party. Some suppliers offer full payment upfront for small discounts. All payment terms are clearly shown during booking."
    },
    {
      id: 5,
      category: 'payment',
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers. Some suppliers also accept cash payments on the day, though card payments are preferred for security and convenience."
    },
    {
      id: 6,
      category: 'suppliers',
      question: "How do you vet your suppliers?",
      answer: "Every supplier goes through our rigorous 5-step verification process: background checks, insurance verification, portfolio review, reference checks, and a probationary period with enhanced monitoring. Only suppliers who consistently deliver excellent service remain in our network."
    },
    {
      id: 7,
      category: 'suppliers',
      question: "What if a supplier doesn't show up?",
      answer: "This is extremely rare due to our vetting process, but if it happens, we have emergency backup suppliers and will do everything possible to save your party. If we can't provide a suitable replacement, you'll receive a full refund plus compensation for the inconvenience."
    },
    {
      id: 8,
      category: 'suppliers',
      question: "Can I contact suppliers directly?",
      answer: "Yes! Once you make a booking, you'll receive the supplier's contact details for direct communication about specific requirements, setup times, and any special requests. We encourage this to ensure everything goes perfectly on your big day."
    },
    {
      id: 9,
      category: 'coverage',
      question: "What areas do you cover?",
      answer: "We currently cover most of England, Scotland, Wales, and Ireland, with strongest coverage in London, Manchester, Birmingham, Glasgow, and Dublin. Our network is rapidly expanding. Enter your postcode on our platform to see available suppliers in your area."
    },
    {
      id: 10,
      category: 'coverage',
      question: "Do suppliers travel outside their usual areas?",
      answer: "Many suppliers are willing to travel for bookings, though this may involve additional travel fees. When you search by location, we show all suppliers available for your area, including those who can travel to you with any additional costs clearly displayed."
    },
    {
      id: 11,
      category: 'support',
      question: "What's included in your guarantee?",
      answer: "Our PartySnap Guarantee covers: supplier no-shows (full refund + backup), quality issues (partial refund or replacement), and booking problems (full support resolution). We're committed to making sure your party is amazing, and we'll go the extra mile to ensure that happens."
    },
    {
      id: 12,
      category: 'support',
      question: "What if I'm not happy with a supplier?",
      answer: "Contact us immediately if there are any issues. We'll work with the supplier to resolve problems quickly. For serious issues, we can arrange partial refunds, replacement services, or full refunds depending on the situation. Your satisfaction is our priority."
    },
    {
      id: 13,
      category: 'support',
      question: "Do you provide support on the day of my party?",
      answer: "Yes! Our support team is available during party hours (9 AM - 8 PM) for any urgent issues. We also provide all suppliers with our emergency contact details, so help is always available if something goes wrong."
    },
    {
      id: 14,
      category: 'account',
      question: "Do I need to create an account to book?",
      answer: "Yes, creating an account allows you to manage your bookings, track your party planning progress, save favorite suppliers, and access your booking history. It takes less than 2 minutes to sign up, and we never spam your inbox."
    },
    {
      id: 15,
      category: 'account',
      question: "How do I track my bookings?",
      answer: "Your personalized dashboard shows all your bookings, payment status, supplier contact details, and countdown timers to your party dates. You'll also receive email and SMS updates for important milestones and reminders."
    },
    {
      id: 16,
      category: 'booking',
      question: "Can I book multiple suppliers for one party?",
      answer: "Absolutely! Most parties benefit from multiple suppliers - entertainers, decorators, catering, etc. Our platform makes it easy to coordinate everything in one place, and we help ensure all suppliers work well together on your big day."
    },
    {
      id: 17,
      category: 'account',
      question: "Can I leave reviews for suppliers?",
      answer: "Yes! After your party, we encourage you to leave honest reviews and ratings. Your feedback helps other parents make informed decisions and helps us maintain high quality standards across our supplier network."
    },
    {
      id: 18,
      category: 'coverage',
      question: "Do you handle outdoor parties?",
      answer: "Yes! Many of our suppliers specialize in outdoor events. We have weather backup plans and can suggest covered alternatives if needed. Outdoor parties often have additional setup requirements, which are clearly communicated during booking."
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section  style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="py-20 bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto mb-8">
              Got questions about PartySnap? We've got answers! Find everything you need to know about planning the perfect party.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 placeholder:text-white py-4 border border-white rounded-2xl focus:ring-2 focus:ring-white focus:border-white text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Category Filter Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                          activeCategory === category.id
                            ? 'bg-primary-100 text-primary-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <category.icon className="w-5 h-5" />
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Still need help?</h4>
                    <Button 
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                      onClick={() => window.location.href = '/contact'}
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl shadow-xl border border-gray-100">
                      <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search terms or browse a different category.
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchTerm('')
                          setActiveCategory('all')
                        }}
                        variant="outline"
                        className="border-primary-500 text-primary-500 hover:bg-primary-50"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    filteredFAQs.map(faq => (
                      <div key={faq.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full text-left px-8 py-6 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 pr-4">
                              {faq.question}
                            </h3>
                            {openFAQs.has(faq.id) ? (
                              <ChevronUp className="w-6 h-6 text-primary-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                        
                        {openFAQs.has(faq.id) && (
                          <div className="px-8 pb-6 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed pt-4">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Contact CTA */}
                <div className="mt-12 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-500))] rounded-3xl p-8 text-white text-center">
                  <h3 className="text-2xl font-bold mb-4">Didn't find what you were looking for?</h3>
                  <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                    Our friendly support team is here to help! Get in touch and we'll answer any questions about planning your perfect party.
                  </p>
                  <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                    <Button 
                      size="lg"
                      className="bg-white text-primary-600 hover:bg-gray-50 font-bold"
                      onClick={() => window.location.href = '/contact'}
                    >
                      Contact Support
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-white text-primary-700 hover:bg-white hover:text-primary-600 font-bold"
                      onClick={() => window.location.href = '/'}
                    >
                      Start Planning Your Party
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Headphones } from "lucide-react"

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Here you would typically send the form data to your API
    // For now, we'll just simulate a submission
    setTimeout(() => {
      alert('Thank you for your message! We\'ll get back to you within 24 hours.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })
      setIsSubmitting(false)
    }, 1000)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch via email",
      contact: "hello@partysnap.com",
      action: "mailto:hello@partysnap.com",
      color: "from-blue-400 to-blue-500"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team",
      contact: "+44 20 1234 5678",
      action: "tel:+442012345678",
      color: "from-green-400 to-green-500"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us instantly",
      contact: "Available 9am-6pm GMT",
      action: "#",
      color: "from-purple-400 to-purple-500"
    },
    {
      icon: Users,
      title: "For Suppliers",
      description: "Join our network",
      contact: "suppliers@partysnap.com",
      action: "mailto:suppliers@partysnap.com",
      color: "from-orange-400 to-orange-500"
    }
  ]

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'booking', label: 'Booking Help' },
    { value: 'supplier', label: 'Become a Supplier' },
    { value: 'press', label: 'Press & Media' },
    { value: 'partnership', label: 'Partnership' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section  style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }}  className="py-20 bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Have questions about PartySnap? Need help planning your party? We're here to help make your celebration magical.
            </p>
          </div>


        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
                  <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-[hsl(var(--primary-500))] transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-[hsl(var(--primary-500))] transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-semibold text-gray-900 mb-2">
                      What can we help you with?
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-[hsl(var(--primary-500))] transition-colors"
                    >
                      {inquiryTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-[hsl(var(--primary-500))] transition-colors"
                      placeholder="Brief subject of your message"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-[hsl(var(--primary-500))] transition-colors resize-vertical"
                      placeholder="Tell us more about how we can help..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-500 hover:bg-[hsl(var(--primary-600))] text-white font-bold text-lg py-4 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Contact Info & FAQ */}
              <div className="space-y-8">
                {/* Quick Info */}
                <div className="bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-3xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">Get Quick Answers</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Response Time</h4>
                        <p className="opacity-90">We typically respond within 24 hours during business days.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Support Hours</h4>
                        <p className="opacity-90">Monday - Friday: 9:00 AM - 6:00 PM GMT</p>
                        <p className="opacity-90">Weekend: Limited support available</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Location</h4>
                        <p className="opacity-90">London, United Kingdom</p>
                        <p className="opacity-90">Serving the UK & Ireland</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common Questions */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Questions</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">How far in advance should I book?</h4>
                      <p className="text-gray-600 text-sm">We recommend booking 2-4 weeks in advance for the best supplier availability, though last-minute bookings are often possible.</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What if a supplier cancels?</h4>
                      <p className="text-gray-600 text-sm">We provide backup options and full support to ensure your party goes ahead as planned. Our guarantee covers you.</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Do you cover my area?</h4>
                      <p className="text-gray-600 text-sm">We currently serve most of the UK and Ireland. Contact us to check availability in your specific location.</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Can't find what you're looking for? Check out our 
                      <a href="/faq" className="text-primary-600 hover:text-primary-700 font-semibold"> FAQ page </a>
                      or send us a message above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
          {/* Contact Methods Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="group bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <p className="text-primary-600 font-semibold">{method.contact}</p>
              </a>
            ))}
          </div>
    </div>
  )
}
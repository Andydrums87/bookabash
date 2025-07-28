"use client"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Tell us about your party",
      description: "Share your theme, date, and details",
    },
    {
      number: 2,
      title: "We create your personalized dashboard",
      description: "Get matched with perfect suppliers for your theme",
    },
    {
      number: 3,
      title: "Review, customize, and book everything",
      description: "Complete coordination in one place",
    },
  ]

  return (
    <section className="py-20 bg-[hsl(var(--primary-50))]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4">How It Works</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          {/* The BookABash Way */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">The PartySnap Way</h3>
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traditional vs Our Way */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Traditional Way vs Our Way</h3>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h4 className="font-bold text-gray-700 mb-6 text-lg">Traditional Way:</h4>
              <div className="flex flex-wrap items-center gap-2 text-gray-600 mb-8">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Search</span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Compare</span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Book</span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Repeat for each supplier</span>
              </div>

              <h4 className="font-bold text-primary-600 mb-6 text-lg">PartySnap Way:</h4>
              <div className="flex flex-wrap items-center gap-2 text-primary-600">
                <span className="bg-primary-100 px-3 py-1 rounded-full text-sm font-medium">Plan</span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-primary-100 px-3 py-1 rounded-full text-sm font-medium">Coordinate</span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-primary-100 px-3 py-1 rounded-full text-sm font-medium">Celebrate</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[hsl(var--primary-100)] to-[hasl(var(--primary-200))] rounded-2xl p-8 border border-[hsl(var(--primary-20))]">
              <p className="text-2xl font-bold text-gray-900 mb-6">
                Why book 6 different suppliers when you can plan 1 complete party?
              </p>
              <Button className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Start Snapping Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

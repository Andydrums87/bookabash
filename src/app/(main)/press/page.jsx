import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Newspaper } from "lucide-react"

export default function Press() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Newspaper className="w-10 h-10 text-primary-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Press
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Coming Soon
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Our press kit and media resources are on the way. For press enquiries in the meantime, please get in touch.
          </p>
          <div className="space-x-4">
            <Link href="/contact">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4">
                Contact Us
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-primary-500 text-primary-500 hover:bg-primary-50 font-bold px-8 py-4">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

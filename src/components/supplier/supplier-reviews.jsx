"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export default function SupplierReviews({ reviews }) {
  const [showAllReviews, setShowAllReviews] = useState(false)

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="border-gray-300">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          <p className="text-gray-600">No reviews yet for this supplier.</p>
        </CardContent>
      </Card>
    )
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  return (
    <Card className="border-gray-300 px-4 md:px-0">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
            <span className="ml-2 font-semibold text-sm">{averageRating.toFixed(1)} out of 5</span>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex-shrink-0 w-80 bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-start gap-3 md:gap-4">
                  <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                    <AvatarImage
                      src={review.avatar || "/placeholder.svg?height=40&width=40&query=avatar"}
                      alt={review.name}
                    />
                    <AvatarFallback>
                      {review.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">{review.name}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs md:text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-3">{review.text}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2">
                        {review.images.map((img, i) => (
                          <div key={i} className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg overflow-hidden">
                            <Image
                              src={"https://res.cloudinary.com/dghzq6xtd/image/upload/v1755554333/nj0fgrabxuya2szxeh2l.jpg"}
                              alt={`Review photo ${i + 1}`}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

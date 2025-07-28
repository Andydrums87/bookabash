"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, DollarSign, ClockIcon, CheckCircle, ImageIcon } from "lucide-react"
import Image from "next/image" // Using Next.js Image component

export function SupplierPackageCard({ packageData, onEdit, onDelete }) {
  if (!packageData) {
    return null
  }

  const { name, description, price, priceType, duration, whatsIncluded, image } = packageData

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {image ? (
        <div className="relative w-full ">
         
          <div
                          className="relative w-[90%] h-[280px] mask-image mx-auto mt-2"
                          style={{
                            WebkitMaskImage: 'url("/image.svg")',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskSize: 'contain',
                            WebkitMaskPosition: 'center',
                            maskImage: 'url("/image.svg")',
                            maskRepeat: 'no-repeat',
                            maskSize: 'contain',
                            maskPosition: 'center',
                          }}
                        >
                          <Image
                            src={
                              image || "/placeholder.png"
                            }
                            alt={name || "Package image"}
                            fill
                            className="object-cover group-hover:brightness-110 transition-all duration-300 "
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-gray-400" />
        </div>
      )}
      <CardHeader className="">
        <CardTitle className="text-2xl">{name || "Unnamed Package"}</CardTitle>
        {description && <CardDescription className="text-sm line-clamp-2 h-auto">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-growspace-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
          <span>
            Price: £{price || "N/A"} {priceType && `(${priceType})`}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <ClockIcon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
          <span>Duration: {duration || "N/A"}</span>
        </div>
        {whatsIncluded && whatsIncluded.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 mt-2">What's Included:</h4>
            <ul className="space-y-1 text-xs">
              {whatsIncluded.slice(0, 3).map(
                (
                  item,
                  index, // Show max 3 items for brevity
                ) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-3 w-3 mr-1.5 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ),
              )}
              {whatsIncluded.length > 3 && <li className="text-xs text-muted-foreground italic ml-4">...and more</li>}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 text-white pt-4 mt-4 mb-4">
        <Button className="bg-primary-500 hover:bg-[hsl(var(--primary-600))]" variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

// Minimal placeholder for AddPackageCard
export function AddPackageCard({ onAdd }) {
  return (
    <Card
      className="flex flex-col items-center justify-center h-full border-2 border-dashed hover:border-[hsl(var(--primary-500))] transition-colors cursor-pointer min-h-[200px]"
      onClick={onAdd}
    >
      <CardContent className="text-center p-6">
        <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground">Add New Package</p>
        <p className="text-sm text-muted-foreground">Click to create a new service package.</p>
      </CardContent>
    </Card>
  )
}

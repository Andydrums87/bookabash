"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, PlusCircle } from "lucide-react"



export function SupplierPackageCard({ packageData, onEdit, onDelete }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{packageData.name}</CardTitle>
        <CardDescription>
          {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(packageData.price)}
          {packageData.priceType === "per_hour" && " / hour"}
          {packageData.priceType === "per_person" && " / person"}
          {packageData.duration && ` - ${packageData.duration}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-2 line-clamp-3">{packageData.description}</p>
        {packageData.whatsIncluded.length > 0 && (
          <>
            <h4 className="font-semibold text-sm mb-1 mt-3">What's Included:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {packageData.whatsIncluded.slice(0, 3).map(
                (
                  item,
                  index, // Show first 3 items
                ) => (
                  <li key={index} className="truncate">
                    {item}
                  </li>
                ),
              )}
              {packageData.whatsIncluded.length > 3 && <li className="text-xs text-muted-foreground">...and more</li>}
            </ul>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(packageData.id)}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(packageData.id)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export function AddPackageCard({ onAdd }) {
  return (
    <Card
      className="flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer min-h-[200px] h-full"
      onClick={onAdd}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <PlusCircle className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-gray-600 font-semibold">Add New Package</p>
        <p className="text-xs text-muted-foreground mt-1">Click to define a new service package</p>
      </CardContent>
    </Card>
  )
}

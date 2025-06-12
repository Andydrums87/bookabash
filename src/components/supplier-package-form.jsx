"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import Image from "next/image"

export function SupplierPackageForm({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [priceType, setPriceType] = useState("flat") // Default to flat
  const [whatsIncluded, setWhatsIncluded] = useState("") // Storing as comma-separated string for simplicity
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || "")
      setDescription(initialData.description || "")
      setPrice(initialData.price || "")
      setDuration(initialData.duration || "")
      setPriceType(initialData.priceType || "flat")
      setWhatsIncluded(initialData.whatsIncluded ? initialData.whatsIncluded.join(", ") : "")
      setImageUrl(initialData.imageUrl || "")
    } else if (isOpen) {
      // Reset form for new package
      setName("")
      setDescription("")
      setPrice("")
      setDuration("")
      setPriceType("flat")
      setWhatsIncluded("")
      setImageUrl("")
    }
  }, [initialData, isOpen])

  const handleSubmit = () => {
    const packageDetails = {
      name,
      description,
      price: Number.parseFloat(price) || 0,
      duration,
      priceType,
      whatsIncluded: whatsIncluded
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item), // Convert string to array
      imageUrl,
    }
    onSave(packageDetails)
    onClose() // Close after save
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Package" : "Add New Package"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the details of your service package."
              : "Fill in the details for your new service package."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="pkg-name">Package Name</Label>
            <Input
              id="pkg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Gold Party Package"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pkg-description">Description</Label>
            <Textarea
              id="pkg-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this package offers..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="pkg-price">Price (£)</Label>
              <Input
                id="pkg-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 250"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pkg-price-type">Price Type</Label>
              <select
                id="pkg-price-type"
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="flat">Flat Rate</option>
                <option value="per_hour">Per Hour</option>
                <option value="per_person">Per Person</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="pkg-duration">Duration</Label>
            <Input
              id="pkg-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 2 hours, 90 minutes"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pkg-whats-included">What's Included (comma-separated)</Label>
            <Textarea
              id="pkg-whats-included"
              value={whatsIncluded}
              onChange={(e) => setWhatsIncluded(e.target.value)}
              placeholder="e.g., Face painting, Balloon animals, Magic show"
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pkg-image-url">Image URL</Label>
            <Input
              id="pkg-image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2 relative w-full h-40 rounded border overflow-hidden">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt="Package preview"
                  layout="fill"
                  objectFit="contain"
                  className="bg-muted"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              In a full application, this would be a file upload. For now, please use a direct image URL.
            </p>
          </div>
        </div>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Package</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

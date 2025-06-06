"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Package } from "./supplier-package-card"



const generateNewId = () => `pkg${Date.now()}${Math.random().toString(36).substring(2, 7)}`

const emptyPackage = {
  // ID will be generated on save if new
  name: "",
  description: "",
  price: 0,
  priceType: "flat",
  duration: "",
  whatsIncluded: [],
}

export function SupplierPackageForm({ isOpen, onClose, onSave, initialData }) {
  const [packageData, setPackageData] = useState(initialData || { ...emptyPackage, id: generateNewId() })
  const [includedItemInput, setIncludedItemInput] = useState("")

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPackageData(initialData)
      } else {
        // For new package, ensure a unique ID is ready (or generate on save)
        setPackageData({ ...emptyPackage, id: generateNewId() })
      }
    }
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setPackageData((prev) => ({ ...prev, [name]: name === "price" ? Number.parseFloat(value) || 0 : value }))
  }

  const handleSelectChange = (name, value) => {
    setPackageData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddIncludedItem = () => {
    if (includedItemInput.trim() !== "") {
      setPackageData((prev) => ({
        ...prev,
        whatsIncluded: [...prev.whatsIncluded, includedItemInput.trim()],
      }))
      setIncludedItemInput("")
    }
  }

  const handleRemoveIncludedItem = (index) => {
    setPackageData((prev) => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!packageData.name || packageData.price <= 0) {
      alert("Package name and a valid price (greater than 0) are required.")
      return
    }
    onSave(packageData) // The ID is already part of packageData
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Package" : "Add New Package"}</DialogTitle>
          <DialogDescription>
            Fill in the details for your service package. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[calc(80vh-150px)] overflow-y-auto pr-3">
            {" "}
            {/* Adjusted max-h and pr */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={packageData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={packageData.description}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (£)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={packageData.price}
                onChange={handleChange}
                className="col-span-3"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priceType" className="text-right">
                Price Type
              </Label>
              <Select
                value={packageData.priceType}
                onValueChange={(value) => handleSelectChange("priceType", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Fee</SelectItem>
                  <SelectItem value="per_hour">Per Hour</SelectItem>
                  <SelectItem value="per_person">Per Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input
                id="duration"
                name="duration"
                value={packageData.duration || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="e.g., 2 hours, Full Day (Optional)"
              />
            </div>
            <div className="col-span-4 space-y-2">
              {" "}
              {/* Changed to col-span-4 and added space-y-2 */}
              <Label htmlFor="whatsIncludedInput">What's Included (items or services)</Label>
              <div className="flex gap-2">
                <Input
                  id="whatsIncludedInput"
                  value={includedItemInput}
                  onChange={(e) => setIncludedItemInput(e.target.value)}
                  placeholder="e.g., Face painting for 10 kids"
                  className="flex-grow"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddIncludedItem()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddIncludedItem} variant="outline">
                  Add Item
                </Button>
              </div>
              {packageData.whatsIncluded.length > 0 && (
                <ul className="space-y-1 mt-2 border rounded-md p-2 max-h-32 overflow-y-auto">
                  {packageData.whatsIncluded.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm p-1.5 bg-muted/50 rounded hover:bg-muted"
                    >
                      <span>{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveIncludedItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            {" "}
            {/* Added margin-top */}
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {" "}
                {/* Removed onClick={onClose} as DialogClose handles it */}
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {" "}
              {/* Changed to type="submit" */}
              {initialData ? "Save Changes" : "Create Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

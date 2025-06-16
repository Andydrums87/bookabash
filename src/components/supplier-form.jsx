// components/supplier-form.jsx - Updated to use the new backend

"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSupplierOnboarding } from "@/utils/mockBackend" // Import the new hook

const serviceTypes = [
  { id: "Entertainment", name: "Entertainment" },
  { id: "Venues", name: "Venues" },
  { id: "Catering", name: "Catering" },
  { id: "Photography", name: "Photography" },
  { id: "Decorations", name: "Decorations" },
  { id: "Activities", name: "Activities & Games" },
  { id: "other", name: "Other" },
]

export function SupplierForm() {
  const router = useRouter()
  const { loading, error, addSupplier } = useSupplierOnboarding() // Use the new hook

  const [formData, setFormData] = useState({
    businessName: "",
    yourName: "",
    email: "",
    phone: "",
    postcode: "",
    supplierType: "",
  })

  const [formError, setFormError] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormError(null)
  }

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, supplierType: value }))

    console.log(formData)
    setFormError(null)
  }

  const validateForm = () => {
    const { businessName, yourName, email, phone, postcode, supplierType } = formData

    if (!businessName || !yourName || !email || !phone || !postcode || !supplierType) {
      setFormError("All fields are required.")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError("Please enter a valid email address.")
      return false
    }
    return true
  }

  const submitForm = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setFormError(null)

    try {
      const result = await addSupplier(formData)
      
      if (result.success) {
        console.log('✅ Supplier added successfully:', result.supplier)
        console.log('🔍 Check localStorage "allSuppliers" to see the new supplier')
        
        // Store the supplier ID so the dashboard knows which supplier this is
        localStorage.setItem('currentSupplierId', result.supplier.id)
        
        // Navigate to success page
        router.push("/suppliers/onboarding/success")
      } else {
        setFormError(result.error || 'Failed to create supplier account')
      }
    } catch (error) {
      console.error("Error during signup:", error)
      setFormError("Something went wrong. Please try again.")
    }
  }
 

  const labelClasses = "text-gray-700 dark:text-gray-300 font-medium"
  const inputClasses =
    "p-6 mt-1 bg-white dark:bg-slate-700 border-slate-400 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-[hsl(var(--primary-500))] focus:border-[hsl(var(--primary-500))]  rounded-md shadow-sm"
  const requiredStar = <span className="text-primary-500">*</span>

  return (
    <form onSubmit={submitForm} className="space-y-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <div>
          <Label htmlFor="businessName" className={labelClasses}>
            Business Name {requiredStar}
          </Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
            placeholder="Your business name"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <Label htmlFor="yourName" className={labelClasses}>
            Your Name {requiredStar}
          </Label>
          <Input
            id="yourName"
            value={formData.yourName}
            onChange={(e) => handleInputChange("yourName", e.target.value)}
            placeholder="Your full name"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className={labelClasses}>
            Email Address {requiredStar}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className={labelClasses}>
            Phone Number {requiredStar}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="07xxx xxx xxx"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <Label htmlFor="supplierType" className={labelClasses}>
            Primary Supplier Type {requiredStar}
          </Label>
          <Select   value={formData.supplierType} 
  onValueChange={(value) => setFormData((prev) => ({ ...prev, supplierType: value }))}>
            <SelectTrigger
              id="supplierType"
              className={`mt-1 w-full ${inputClasses.replace("placeholder:text-gray-400 dark:placeholder:text-gray-500", "")}`}
            >
              <SelectValue placeholder="Select your main service type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              {serviceTypes.map((type) => (
                <SelectItem key={type.id} value={type.id} className="hover:bg-gray-100 dark:hover:bg-slate-600">
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="postcode" className={labelClasses}>
            Business Postcode {requiredStar}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <Input
              id="postcode"
              value={formData.postcode}
              onChange={(e) => handleInputChange("postcode", e.target.value)}
              placeholder="e.g. SW1A 1AA"
              className={`pl-10 ${inputClasses}`}
              required
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This helps us match you with nearby customers.
          </p>
        </div>
      </div>

      {/* Show errors */}
      {(formError || error) && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          {formError || error}
        </p>
      )}

      <div className="mt-8 md:col-span-2 flex justify-end">
        <Button
          type="submit"
          className="bg-primary-600 hover:bg-[hsl(var(--primary-700))] text-white dark:bg-primary-500 dark:hover:bg-primary-600 px-8 py-7 shadow-2xl text-base text-lg font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:bg-[hsl(var(--primary-500))]  focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Join BookABash"}
        </Button>
      </div>
    </form>
  )
}
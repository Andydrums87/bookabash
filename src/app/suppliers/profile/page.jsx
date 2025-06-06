"use client"

import React from "react"

import { useState } from "react"
import SupplierLayout from "@/components/supplier-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddPackageCard, SupplierPackageCard, Package } from "@/components/supplier-package-card"
import { SupplierPackageForm } from "@/components/supplier-package-form"
import { AlertCircle, Building, Palette, Briefcase, CalendarDays, ShieldCheck, PackageIcon } from "lucide-react"

// Mock data - in a real app, this would come from your backend
const initialSupplierData = {
  id: "supplier123",
  businessName: "Party Heroes Entertainment",
  contactName: "Jane Doe",
  email: "jane.doe@partyheroes.com",
  phone: "07123456789",
  postcode: "SW1A 1AA",
  businessDescription: "Top-tier entertainment services for all ages. We bring the fun to your party!",
  serviceType: "entertainer", // "entertainer" or "venue"
  // ... other general fields
}

const initialPackages = [
  {
    id: "pkg1",
    name: "Basic Fun Package",
    description: "Our entry-level package perfect for small gatherings.",
    price: 150,
    priceType: "flat",
    duration: "1 hour",
    whatsIncluded: ["1 Entertainer", "Basic balloon modelling", "Party games"],
  },
  {
    id: "pkg2",
    name: "Ultimate Party Package",
    description: "The all-inclusive package for an unforgettable event.",
    price: 300,
    priceType: "flat",
    duration: "2 hours",
    whatsIncluded: ["2 Entertainers", "Advanced balloon modelling", "Magic show", "Face painting", "Music system"],
  },
]

// Placeholder components for type-specific forms
const VenueDetailsForm = () => (
  <Card>
    <CardHeader>
      <CardTitle>Venue Specifics</CardTitle>
      <CardDescription>Edit details specific to your venue.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="venueType">Venue Type</Label>
        <Input id="venueType" placeholder="e.g., Hall, Outdoor Space, Soft Play Center" />
      </div>
      <div>
        <Label htmlFor="capacity">Max Capacity</Label>
        <Input id="capacity" type="number" placeholder="e.g., 100" />
      </div>
      <p className="text-sm text-muted-foreground">More venue-specific fields here...</p>
    </CardContent>
  </Card>
)

const EntertainerDetailsForm = () => (
  <Card>
    <CardHeader>
      <CardTitle>Entertainer Specifics</CardTitle>
      <CardDescription>Edit details specific to your entertainment services.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="actType">Act Type / Specialties</Label>
        <Input id="actType" placeholder="e.g., Magician, Clown, Face Painter, DJ" />
      </div>
      <div>
        <Label htmlFor="performanceDuration">Typical Performance Durations</Label>
        <Input id="performanceDuration" placeholder="e.g., 1 hour, 2 hours, Custom" />
      </div>
      <p className="text-sm text-muted-foreground">More entertainer-specific fields here...</p>
    </CardContent>
  </Card>
)

export default function SupplierProfilePage() {
  const [supplierData, setSupplierData] = useState(initialSupplierData)
  const [packages, setPackages] = useState(initialPackages)
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSupplierData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOpenPackageForm = (pkg = null) => {
    setEditingPackage(pkg)
    setIsPackageFormOpen(true)
  }

  const handleClosePackageForm = () => {
    setIsPackageFormOpen(false)
    setEditingPackage(null)
  }

  const handleSavePackage = (newPackageData) => {
    setPackages((prevPackages) => {
      if (editingPackage) {
        return prevPackages.map((p) => (p.id === editingPackage.id ? { ...p, ...newPackageData } : p))
      } else {
        return [...prevPackages, { ...newPackageData, id: `pkg${Date.now()}` }]
      }
    })
    handleClosePackageForm()
  }

  const handleDeletePackage = (packageId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      setPackages((prevPackages) => prevPackages.filter((p) => p.id !== packageId))
    }
  }

  // In a real app, you'd have a save function to persist changes to the backend
  const handleSaveChanges = () => {
    console.log("Saving supplier data:", supplierData)
    console.log("Saving packages:", packages)
    // Here you would make an API call
    alert("Changes saved (mocked)!")
  }

  return (
    <SupplierLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Your Profile</h1>
            <p className="text-gray-600">Keep your public information and service details up to date.</p>
          </div>
          <Button onClick={handleSaveChanges} size="lg">
            Save All Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="general">
              <Briefcase className="w-4 h-4 mr-2 inline-block" />
              General
            </TabsTrigger>
            <TabsTrigger value="service-details">
              <Palette className="w-4 h-4 mr-2 inline-block" />
              Service Details
            </TabsTrigger>
            <TabsTrigger value="packages">
              <PackageIcon className="w-4 h-4 mr-2 inline-block" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="portfolio">
              <Building className="w-4 h-4 mr-2 inline-block" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="availability">
              <CalendarDays className="w-4 h-4 mr-2 inline-block" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="verification">
              <ShieldCheck className="w-4 h-4 mr-2 inline-block" />
              Verification
            </TabsTrigger>
     
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic details about your business.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={supplierData.businessName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Person</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      value={supplierData.contactName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={supplierData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={supplierData.phone} onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" name="postcode" value={supplierData.postcode} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={supplierData.businessDescription}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 inline-block mr-1" />
                  To change your primary service type (e.g., from Entertainer to Venue), please contact support.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service-details">
            {supplierData.serviceType === "venue" ? <VenueDetailsForm /> : <EntertainerDetailsForm />}
          </TabsContent>

          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle>Service Packages</CardTitle>
                <CardDescription>Define and manage the packages you offer to customers.</CardDescription>
              </CardHeader>
              <CardContent>
                {packages.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">You haven't added any packages yet.</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <SupplierPackageCard
                      key={pkg.id}
                      packageData={pkg}
                      onEdit={() => handleOpenPackageForm(pkg)}
                      onDelete={() => handleDeletePackage(pkg.id)}
                    />
                  ))}
                  <AddPackageCard onAdd={() => handleOpenPackageForm(null)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio / Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage your photos and videos here. (Feature coming soon)</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Set your working hours and unavailable dates. (Feature coming soon)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View and manage your verification documents. (Feature coming soon)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <SupplierPackageForm
          isOpen={isPackageFormOpen}
          onClose={handleClosePackageForm}
          onSave={handleSavePackage}
          initialData={editingPackage}
        />
      </div>
    </SupplierLayout>
  )
}

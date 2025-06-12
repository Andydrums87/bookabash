"use client"

// ... (Keep all other imports and existing state/functions)
import { ScrollArea } from "@/components/ui/scroll-area" // Ensure this is imported if not already
import { useState } from "react" // Ensure useEffect is imported
import {
  AlertCircle,
  Building,
  Palette,
  Briefcase,
  CalendarDays,
  ShieldCheck,
  PackageIcon,
  UploadCloud,
  Trash2,
  ImagePlus,
  Video,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  PlusCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SupplierPackageCard, AddPackageCard } from "@/components/supplier-package-card" // Ensure AddPackageCard is imported
import { SupplierPackageForm } from "@/components/supplier-package-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { format, isEqual, startOfDay } from "date-fns"
import NextImage from "next/image" //
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" 

// Mock data - in a real app, this would come from your backend
const initialSupplierData = {
  id: "supplier123",
  businessName: "Party Heroes Entertainment",
  contactName: "Jane Doe",
  email: "jane.doe@partyheroes.com",
  phone: "07123456789",
  postcode: "SW1A 1AA",
  businessDescription: "Top-tier entertainment services for all ages. We bring the fun to your party!",
  serviceType: "entertainer", // or "venue"
}

const initialPackages = [
  {
    id: "pkg1",
    name: "Basic Fun Package",
    description:
      "Our entry-level package perfect for small gatherings. Includes one entertainer, basic balloon modelling, and fun party games to keep the little ones engaged.",
    price: 150,
    priceType: "flat",
    duration: "1 hour",
    whatsIncluded: ["1 Entertainer", "Basic balloon modelling", "Party games"],
    imageUrl: "/placeholder.svg?height=300&width=400&text=Basic+Fun", // Added imageUrl
  },
  {
    id: "pkg2",
    name: "Ultimate Party Package",
    description:
      "The all-inclusive package for an unforgettable event. Features two entertainers, advanced balloon modelling, a captivating magic show, face painting, and a music system.",
    price: 300,
    priceType: "flat",
    duration: "2 hours",
    whatsIncluded: ["2 Entertainers", "Advanced balloon modelling", "Magic show", "Face painting", "Music system"],
    imageUrl: "/placeholder.svg?height=300&width=400&text=Ultimate+Party", // Added imageUrl
  },
  {
    id: "pkg3",
    name: "Princess Dream Package",
    description:
      "A magical experience with a real-life princess! Includes themed games, storytelling, and a special crowning ceremony for the birthday child.",
    price: 220,
    priceType: "flat",
    duration: "1.5 hours",
    whatsIncluded: ["Princess Entertainer", "Themed Games", "Storytelling", "Crowning Ceremony"],
    imageUrl: "/placeholder.svg?height=300&width=400&text=Princess+Dream", // Added imageUrl
  },
]

// --- VenueDetailsForm, EntertainerDetailsForm, PortfolioGalleryTabContent, AvailabilityTabContent, VerificationDocumentsTabContent ---
// --- These components remain the same as in your previous version ---
// --- Make sure they are defined or imported correctly ---

const VenueDetailsForm = () => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Venue Specifics</CardTitle>
      <CardDescription>Provide detailed information about your venue.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="venueType">Venue Type</Label>
          <Input id="venueType" placeholder="e.g., Hall, Outdoor Space" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="capacity">Max Capacity</Label>
          <Input id="capacity" type="number" placeholder="e.g., 100" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Facilities</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
          {["Kitchen", "Parking", "Toilets", "Sound System", "Projector", "Garden", "Wi-Fi", "Stage"].map(
            (facility) => (
              <div key={facility} className="flex items-center space-x-2">
                <Checkbox id={`facility-${facility}`} />
                <Label htmlFor={`facility-${facility}`} className="font-normal text-sm">
                  {facility}
                </Label>
              </div>
            ),
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="accessibility">Accessibility Features</Label>
        <Textarea
          id="accessibility"
          placeholder="e.g., Wheelchair accessible, step-free access, accessible toilets..."
        />
      </div>
    </CardContent>
  </Card>
)

const EntertainerDetailsForm = () => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Entertainer Specifics</CardTitle>
      <CardDescription>Provide detailed information about your entertainment services.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="actType">Act Type / Specialties</Label>
          <Input id="actType" placeholder="e.g., Magician, Clown, Face Painter, DJ" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ageGroups">Target Age Groups</Label>
          <Input id="ageGroups" placeholder="e.g., 3-5 years, 6-10 years, All ages" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="travelRadius">Travel Radius (miles)</Label>
          <Input id="travelRadius" type="number" placeholder="e.g., 20" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="equipment">Equipment Provided</Label>
          <Input id="equipment" placeholder="e.g., Sound system, lighting, props, costumes" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Performance Options</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
          {["Indoor", "Outdoor", "Virtual Events", "Workshops", "Walkaround"].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox id={`option-${option}`} />
              <Label htmlFor={`option-${option}`} className="font-normal text-sm">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

    </CardContent>
  </Card>
)

const PortfolioGalleryTabContent = () => {
  const [images, setImages] = useState([
    { id: 1, src: "/placeholder.svg?height=300&width=300&text=Portfolio+1", alt: "Portfolio Image 1" },
    { id: 2, src: "/placeholder.svg?height=300&width=300&text=Portfolio+2", alt: "Portfolio Image 2" },
    { id: 3, src: "/placeholder.svg?height=300&width=300&text=Portfolio+3", alt: "Portfolio Image 3" },
  ])
  const [videoLinks, setVideoLinks] = useState([{ id: 1, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }])

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>
            Upload high-quality photos of your services. The first image will be your main cover photo. Drag to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {images.map((img, index) => (
              <div key={img.id} className="relative group aspect-square">
                <NextImage // Using NextImage
                  src={img.src || "/placeholder.svg"}
                  alt={img.alt}
                  width={300}
                  height={300}
                  className="rounded-lg object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <span className="text-white text-xs absolute bottom-2 left-2 bg-black/50 px-1 py-0.5 rounded">
                    {index === 0 ? "Cover Photo" : `Image ${index + 1}`}
                  </span>
                </div>
              </div>
            ))}
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-square cursor-pointer hover:border-[hsl(var(--primary-500))] transition-colors"
            >
              <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Add Photo</span>
              <Input id="photo-upload" type="file" className="sr-only" accept="image/*" />
            </label>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Video Links</CardTitle>
          <CardDescription>Add links to YouTube or Vimeo videos showcasing your services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {videoLinks.map((video) => (
              <div key={video.id} className="flex items-center gap-2">
                <Video className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input defaultValue={video.url} placeholder="https://youtube.com/..." className="flex-1" />
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-[hsl(var(--destructive))]">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input placeholder="Add new video link (e.g., https://youtube.com/...)" />
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Video
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const AvailabilityTabContent = () => {
  const [workingHours, setWorkingHours] = useState({
    Monday: { active: true, start: "09:00", end: "17:00" },
    Tuesday: { active: true, start: "09:00", end: "17:00" },
    Wednesday: { active: true, start: "09:00", end: "17:00" },
    Thursday: { active: true, start: "09:00", end: "17:00" },
    Friday: { active: true, start: "09:00", end: "17:00" },
    Saturday: { active: true, start: "10:00", end: "16:00" },
    Sunday: { active: false, start: "10:00", end: "16:00" },
  })

  const [unavailableDates, setUnavailableDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handleDateSelect = (date) => {
    if (!date) return
    const normalizedDate = startOfDay(date)
    setUnavailableDates((prev) =>
      prev.some((d) => isEqual(d, normalizedDate))
        ? prev.filter((d) => !isEqual(d, normalizedDate))
        : [...prev, normalizedDate],
    )
  }

  const modifiers = { unavailable: unavailableDates }
  const modifiersStyles = {
    unavailable: {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
      borderRadius: "var(--radius)",
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3 shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Working Hours</CardTitle>
          <CardDescription>Set your standard availability for each day of the week.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(workingHours).map(([day, hours]) => (
            <div
              key={day}
              className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`day-${day}`}
                  checked={hours.active}
                  onCheckedChange={
                    (checked) => setWorkingHours((prev) => ({ ...prev, [day]: { ...prev[day], active: !!checked } })) // Ensure boolean
                  }
                />
                <Label htmlFor={`day-${day}`} className="font-semibold w-20 text-sm">
                  {day}
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Input
                  type="time"
                  defaultValue={hours.start}
                  disabled={!hours.active}
                  aria-label={`${day} start time`}
                />
                <Input type="time" defaultValue={hours.end} disabled={!hours.active} aria-label={`${day} end time`} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle>Manage Unavailable Dates</CardTitle>
          <CardDescription>Click on a date to mark it as unavailable (red) or available.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Calendar
            mode="multiple" // Allow selecting multiple dates for unavailability
            selected={unavailableDates}
            onSelect={setUnavailableDates} // Simplified selection
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border p-0"
            classNames={{
              day_selected:
                "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90",
              day_today: "ring-1 ring-primary text-primary",
            }}
          />
          <div className="mt-4 w-full space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Unavailable Dates:</h4>
            {unavailableDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dates marked as unavailable.</p>
            ) : (
              <ScrollArea className="h-32">
                <ul className="text-sm space-y-1">
                  {unavailableDates
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((date) => (
                      <li key={date.toISOString()} className="flex justify-between items-center p-1.5 bg-muted rounded">
                        <span>{format(date, "PPP")}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setUnavailableDates((prev) => prev.filter((d) => !isEqual(d, date)))}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </li>
                    ))}
                </ul>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const VerificationDocumentsTabContent = () => {
  const [documents, setDocuments] = useState({
    dbs: { name: "dbs_certificate.pdf", status: "approved", required: true },
    insurance: { name: null, status: "missing", required: true },
    license: { name: "business_license.pdf", status: "pending", required: false },
    id: { name: "photo_id.jpg", status: "approved", required: true },
  })

  const statusConfig = {
    approved: { icon: CheckCircle, color: "text-green-600", text: "Approved" },
    pending: { icon: Clock, color: "text-yellow-600", text: "Pending Review" },
    missing: { icon: XCircle, color: "text-red-600", text: "Missing" },
    rejected: { icon: AlertCircle, color: "text-red-700", text: "Rejected" },
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Verification Documents</CardTitle>
        <CardDescription>
          Upload required documents to get verified and build trust with customers. Verified suppliers often get more
          bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { id: "dbs", title: "DBS Certificate" },
          { id: "insurance", title: "Public Liability Insurance" },
          { id: "license", title: "Business License / Certification" },
          { id: "id", title: "Photo ID (Passport/Driving License)" },
        ].map((docType) => {
          const doc = documents[docType.id]
          const currentStatus = statusConfig[doc.status]
          return (
            <div
              key={docType.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  {docType.title} {doc.required && <span className="text-red-500 text-xs ml-1">(Required)</span>}
                </h4>
                <div className={`flex items-center gap-2 text-sm mt-1 ${currentStatus.color}`}>
                  <currentStatus.icon className="h-5 w-5" />
                  <span>{currentStatus.text}</span>
                </div>
                {doc.name && <p className="text-xs text-muted-foreground mt-1 truncate">File: {doc.name}</p>}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" /> {doc.name ? "Replace File" : "Upload File"}
                </Button>
                {doc.name && (
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function SupplierProfilePage() {
  const [supplierData, setSupplierData] = useState(initialSupplierData)
  const [packages, setPackages] = useState(initialPackages) // Uses updated initialPackages
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [activeTab, setActiveTab] = useState("general")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSupplierData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOpenPackageForm = (pkg) => {
    setEditingPackage(pkg) // pkg can be null for new, or an object for editing
    setIsPackageFormOpen(true)
  }

  const handleClosePackageForm = () => {
    setIsPackageFormOpen(false)
    setEditingPackage(null) // Clear editing package on close
  }

  const handleSavePackage = (newPackageData) => {
    setPackages((prevPackages) => {
      if (editingPackage && editingPackage.id) {
        // Check if editingPackage and its id exist
        // Editing existing package
        return prevPackages.map((p) => (p.id === editingPackage.id ? { ...p, ...newPackageData } : p))
      } else {
        // Adding new package
        return [...prevPackages, { ...newPackageData, id: `pkg${Date.now()}` }]
      }
    })
    // No need to call handleClosePackageForm here, it's called in the form itself
  }

  const handleDeletePackage = (packageId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      setPackages((prevPackages) => prevPackages.filter((p) => p.id !== packageId))
    }
  }

  const handleSaveChanges = () => {
    console.log("Saving supplier data:", supplierData)
    console.log("Saving packages:", packages)
    alert("Changes saved (mocked)!")
  }

  const tabItems = [
    { value: "general", label: "General", icon: Briefcase },
    { value: "service-details", label: "Service Details", icon: Palette },
    { value: "packages", label: "Packages", icon: PackageIcon },
    { value: "portfolio", label: "Portfolio", icon: Building },
    { value: "availability", label: "Availability", icon: CalendarDays },
    { value: "verification", label: "Verification", icon: ShieldCheck },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Manage Your Profile</h1>
          <p className="text-muted-foreground">Keep your public information and service details up to date.</p>
        </div>
        <Button onClick={handleSaveChanges} size="lg">
          <Save className="mr-2 h-5 w-5" /> Save All Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile Select for Tabs */}
        <div className="md:hidden mb-4">
          <Label htmlFor="mobile-tabs-select" className="sr-only">
            Select Profile Section
          </Label>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger id="mobile-tabs-select" className="w-full">
              <div className="flex items-center">
                {/* Optionally show current tab icon in trigger */}
                {/* {tabItems.find(tab => tab.value === activeTab)?.icon({ className: "w-4 h-4 mr-2 text-muted-foreground"})} */}
                <SelectValue placeholder="Select a section..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {tabItems.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  <div className="flex items-center">
                    <tab.icon className="w-4 h-4 mr-2 text-muted-foreground ml-5" />
                    {tab.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop TabsList */}
        <TabsList className="hidden md:grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 gap-1 p-1 h-auto bg-muted rounded-lg">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-col sm:flex-row h-auto py-2 data-[state=active]:bg-white text-gray-500 data-[state=active]:shadow-sm"
            >
              <tab.icon className="w-4 h-4 mr-0 mb-1 sm:mr-2 sm:mb-0" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TabsContent sections remain the same */}
        <TabsContent value="general">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about your business. This information will be public.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={supplierData.businessName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-1">
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
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" value={supplierData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={supplierData.phone} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="postcode">Operating Postcode (for location search)</Label>
                <Input id="postcode" name="postcode" value={supplierData.postcode} onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="businessDescription">Business Description (tell customers about you)</Label>
                <Textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={supplierData.businessDescription}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Describe your services, experience, and what makes you unique..."
                />
              </div>
              <div className="text-sm text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  To change your primary service type (e.g., from Entertainer to Venue), please contact support. This
                  helps us categorize your services correctly.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-details">
          {supplierData.serviceType === "venue" ? <VenueDetailsForm /> : <EntertainerDetailsForm />}
        </TabsContent>

        <TabsContent value="packages">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <CardTitle>Service Packages</CardTitle>
                <CardDescription>Define and manage the packages you offer to customers.</CardDescription>
              </div>
              <Button onClick={() => handleOpenPackageForm(null)} className="mt-2 sm:mt-0">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
              </Button>
            </CardHeader>
            <CardContent>
              {packages.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">No packages yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by adding your first service package.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => handleOpenPackageForm(null)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioGalleryTabContent />
        </TabsContent>
        <TabsContent value="availability">
          <AvailabilityTabContent />
        </TabsContent>
        <TabsContent value="verification">
          <VerificationDocumentsTabContent />
        </TabsContent>
      </Tabs>

      <SupplierPackageForm
        isOpen={isPackageFormOpen}
        onClose={handleClosePackageForm}
        onSave={handleSavePackage}
        initialData={editingPackage}
      />
    </div>
  )
}

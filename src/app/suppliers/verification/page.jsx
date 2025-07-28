"use client"


import { useState } from "react" // Ensure useEffect is imported

import {
  AlertCircle,
  UploadCloud,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"

const VerificationDocumentsTabContent = () => {

    const { supplier, supplierData, setSupplierData, loading, error, refresh } = useSupplier()
    const { saving, updateProfile } = useSupplierDashboard()

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
      <Card className="shadow-sm py-10">
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

  
  export default VerificationDocumentsTabContent;
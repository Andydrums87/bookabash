import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

export default function PartyOverrideConfirmation({ 
  isOpen, 
  onConfirm, 
  onCancel,
  existingPartyDetails 
}) {
  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return null
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              You Already Have a Party Plan!
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-gray-600 space-y-3 pt-2">
            <p>
              You currently have a{" "}
              {existingPartyDetails?.source === 'database' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                  Saved
                </span>
              )}
              {" "}party plan
              {existingPartyDetails?.childName && (
                <span>
                  {" "}for{" "}
                  <span className="font-semibold text-gray-900">
                    {existingPartyDetails.childName}
                  </span>
                </span>
              )}
              {existingPartyDetails?.date && formatDate(existingPartyDetails.date) && (
                <span>
                  {" "}on{" "}
                  <span className="font-semibold text-gray-900">
                    {formatDate(existingPartyDetails.date)}
                  </span>
                </span>
              )}
              .
            </p>
            <div className="text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="font-semibold mb-1">⚠️ Warning</p>
              <p>
                Creating a new party will permanently replace your current plan and all selected suppliers.
                {existingPartyDetails?.source === 'database' && (
                  <span className="block mt-1 text-sm">
                    This includes your saved party in your account.
                  </span>
                )}
              </p>
            </div>
            <p className="font-medium text-gray-900">
              Would you like to continue and create a new party?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
          <AlertDialogCancel 
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 w-full sm:w-auto"
          >
            Keep Current Plan
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-primary hover:bg-primary-dark text-white w-full sm:w-auto"
          >
            Create New Party
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
import SupplierLayout from "@/components/supplier-layout"
import { Button } from "@/components/ui/button"

export default function SupplierLeadsPage() {
  return (
    <SupplierLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Lead Inbox</h1>
        <p className="text-gray-600">This page will display all your leads in detail.</p>
        <div className="mt-4">
          <Button asChild>
            <a href="/suppliers/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    </SupplierLayout>
  )
}

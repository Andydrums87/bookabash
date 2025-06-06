import SupplierLayout from "@/components/supplier-layout"
import { Button } from "@/components/ui/button"

export default function SupplierEarningsPage() {
  return (
    <SupplierLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>
        <p className="text-gray-600">Track your earnings, invoices, and payment history.</p>
        <div className="mt-4">
          <Button asChild>
            <a href="/suppliers/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    </SupplierLayout>
  )
}

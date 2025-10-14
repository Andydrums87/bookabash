// components/PartyJourney/SupplierSummary.jsx
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, CheckCircle, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export function SupplierSummaryCollapsible({ suppliers, enquiries }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const supplierList = Object.entries(suppliers)
    .filter(([type, supplier]) => type !== 'einvites' && supplier)
    .map(([type, supplier]) => {
      const enquiry = enquiries.find(e => e.supplier_category === type)
      return {
        type,
        supplier,
        status: enquiry?.status || 'pending'
      }
    })

  const confirmedCount = supplierList.filter(s => s.status === 'accepted').length
  const totalCount = supplierList.length

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">Your Party Team</h3>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {confirmedCount}/{totalCount} confirmed
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-6 space-y-3">
            {supplierList.map(({ type, supplier, status }) => (
              <div 
                key={type}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {status === 'accepted' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-500" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/supplier/${supplier.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            ))}

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/browse">
                <Plus className="w-4 h-4 mr-2" />
                Add More Suppliers
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
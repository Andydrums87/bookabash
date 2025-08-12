// components/Sidebar.jsx - Dashboard sidebar content
import { Card } from "@/components/ui/card"
import BudgetControls from "@/components/budget-controls"
import CountdownWidget from "../../components/ui/CountdownWidget"
import PartyExcitementMeter from "../../components/ui/PartyExcitementMeter"
import ReferFriend from "@/components/ReferFriend"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import SnappysPresentParty from "./SnappysPresentParty"
export default function Sidebar({
  partyData,
  totalCost,
  isPaymentConfirmed,
  partyDate,
  budgetControlProps,
  suppliers,
  enquiries,
  timeRemaining,
  onPaymentReady,
  showPaymentCTA,
}) {

  const router = useRouter()
  if (!partyData) return null

  // FIXED: Calculate payment completion based on actual enquiry states
  const hasUnpaidAcceptedSuppliers = enquiries.some(e => 
    e.status === 'accepted' && e.payment_status === 'unpaid'
  )

  const actuallyPaymentComplete = !hasUnpaidAcceptedSuppliers
  const shouldShowPaymentCTA = hasUnpaidAcceptedSuppliers

  return (
    <aside className="lg:block hidden space-y-6">
      <SnappysPresentParty 
        suppliers={suppliers}
        enquiries={enquiries}
        timeRemaining={24}
        onPaymentReady={onPaymentReady}
        showPaymentCTA={shouldShowPaymentCTA}  // Based on actual enquiry states
        isPaymentComplete={actuallyPaymentComplete}  // Based on actual enquiry states
      />
      
      {!isPaymentConfirmed && budgetControlProps && (
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <BudgetControls {...budgetControlProps} />
        </Card>
      )}
      
      {/* Rest of your sidebar content */}
      <div className="mt-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/party-summary')}
          className="relative w-full text-3xl font-bold pl-8 text-white flex justify-start border-none py-10  hover:bg-[hsl(var(--primary-500))]  hover:text-white bg-primary-400 shadow-sm"
        >
          <div className="bg-primary-500 p-3 rounded-xl shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <img src="/Vector.svg" alt="" className="absolute w-18 right-0" />
          Party Summary
        </Button>
      </div>
      
      <CountdownWidget partyDate={partyDate}/>
      <ReferFriend />
    </aside>
  )
}
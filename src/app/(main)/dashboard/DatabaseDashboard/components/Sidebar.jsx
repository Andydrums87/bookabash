// components/Sidebar.jsx - Dashboard sidebar content
import { Card } from "@/components/ui/card"
import BudgetControls from "@/components/budget-controls"
import CountdownWidget from "../../components/ui/CountdownWidget"
import PartyExcitementMeter from "../../components/ui/PartyExcitementMeter"
import ReferFriend from "@/components/ReferFriend"


export default function Sidebar({
  partyData,
  totalCost,
  isPaymentConfirmed,
  partyDate,
  budgetControlProps
}) {
  if (!partyData) return null

  return (
    <aside className="lg:block space-y-6">
      {/* Budget Controls - only show if not payment confirmed */}
      {!isPaymentConfirmed && budgetControlProps && (
        <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <BudgetControls {...budgetControlProps} />
        </Card>
      )}
      
<CountdownWidget partyDate={partyDate}/>
<ReferFriend />
      
    
         
    </aside>
  )
}

// Helper function to create suppliers object
function createSuppliersObject(partyData) {
  return {
    venue: partyData.venue || null,
    entertainment: partyData.entertainment || null,
    catering: partyData.catering || null,
    facePainting: partyData.facePainting || null,
    activities: partyData.activities || null,
    partyBags: partyData.partyBags || null,
    decorations: partyData.decorations || null,
    balloons: partyData.balloons || null,
  }
}
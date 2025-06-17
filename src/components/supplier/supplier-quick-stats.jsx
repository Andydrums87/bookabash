import { Card, CardContent } from "@/components/ui/card"

export default function SupplierQuickStats({ supplier }) {
  const stats = [
    { label: "Response Time", value: supplier?.responseTime || "N/A" },
    { label: "Parties Completed", value: supplier?.stats?.partiesCompleted || "150+" },
    { label: "Repeat Customers", value: `${supplier?.stats?.repeatCustomerRate || 85}%` },
    { label: "Years Experience", value: supplier?.stats?.yearsExperience || "5 years" },
  ]

  return (
    <Card className="border-gray-300">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Quick Stats</h2>
        <div className="space-y-3 md:space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between text-sm md:text-base">
              <span className="text-gray-600">{stat.label}</span>
              <span className="font-semibold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

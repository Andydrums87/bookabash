import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle, Star } from "lucide-react"

const CompactAddonCard = ({ addon, onRemove }) => {
  // Category styling
  const getCategoryStyles = (category) => {
    const styles = {
      'enhancement': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', emoji: '✨' },
      'time': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', emoji: '⏰' },
      'premium': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', emoji: '🌟' },
      'logistics': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', emoji: '🚗' },
      'seasonal': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', emoji: '🎄' }
    }
    return styles[category] || styles['enhancement']
  }

  const categoryStyle = getCategoryStyles(addon.category)

  return (
    <Card className={`${categoryStyle.bg} ${categoryStyle.border} border-2 shadow-sm hover:shadow-md transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header with category badge */}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${categoryStyle.bg} ${categoryStyle.text} text-xs px-2 py-1`}>
                {categoryStyle.emoji} {addon.category || 'Enhancement'}
              </Badge>
              {addon.supplierName && (
                <span className="text-xs text-gray-500">from {addon.supplierName}</span>
              )}
            </div>

            {/* Add-on name and description */}
            <h4 className="font-semibold text-gray-900 text-base mb-1">{addon.name}</h4>
            {addon.description && (
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{addon.description}</p>
            )}

            {/* Footer with status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Added to Party
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">£{addon.price}</div>
              </div>
            </div>
          </div>

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(addon.id)
            }}
            className="ml-3 w-6 h-6 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Remove add-on"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CompactAddonCard
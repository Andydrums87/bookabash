/**
 * SupplierNote - Subtle category-specific notes for supplier modals
 *
 * Usage:
 *   <SupplierNote category="partyBags" />
 *   <SupplierNote category="cakes" className="mt-4" />
 */

const CATEGORY_NOTES = {
  // Party Bags
  partyBags: "Contents may vary slightly based on stock and to suit the theme and age group.",
  partybags: "Contents may vary slightly based on stock and to suit the theme and age group.",
  "party bags": "Contents may vary slightly based on stock and to suit the theme and age group.",
  "Party Bags": "Contents may vary slightly based on stock and to suit the theme and age group.",

  // Cakes
  cakes: "Images show example designs. Your cake will be freshly made and may vary slightly.",
  cake: "Images show example designs. Your cake will be freshly made and may vary slightly.",
  Cakes: "Images show example designs. Your cake will be freshly made and may vary slightly.",

  // Entertainment
  entertainment: "Performer assigned based on availability. All entertainers are vetted and trained to the same standard.",
  Entertainment: "Performer assigned based on availability. All entertainers are vetted and trained to the same standard.",

  // Face Painting
  facePainting: "Designs shown are examples. Artists adapt designs to suit your theme and requests.",
  facepainting: "Designs shown are examples. Artists adapt designs to suit your theme and requests.",
  "face painting": "Designs shown are examples. Artists adapt designs to suit your theme and requests.",
  "Face Painting": "Designs shown are examples. Artists adapt designs to suit your theme and requests.",

  // Balloons
  balloons: "Colours and styles may vary slightly. We always match your theme as closely as possible.",
  Balloons: "Colours and styles may vary slightly. We always match your theme as closely as possible.",

  // Decorations
  decorations: "Product styles may vary based on stock. We always match your theme.",
  Decorations: "Product styles may vary based on stock. We always match your theme.",

  // Sweet Treats
  sweetTreats: "Selection may vary based on availability. Always a delicious variety to match your theme.",
  sweettreats: "Selection may vary based on availability. Always a delicious variety to match your theme.",
  "sweet treats": "Selection may vary based on availability. Always a delicious variety to match your theme.",
  "Sweet Treats": "Selection may vary based on availability. Always a delicious variety to match your theme.",

  // Activities / Soft Play
  activities: "Equipment shown is representative. Exact items and colours may vary slightly based on availability.",
  Activities: "Equipment shown is representative. Exact items and colours may vary slightly based on availability.",
  softPlay: "Equipment shown is representative. Exact items and colours may vary slightly based on availability.",
  "soft play": "Equipment shown is representative. Exact items and colours may vary slightly based on availability.",

  // Catering
  catering: "Menu items may vary slightly based on seasonal availability.",
  Catering: "Menu items may vary slightly based on seasonal availability.",

  // Bouncy Castle
  bouncyCastle: "Equipment shown is representative. Exact model may vary based on availability.",
  bouncy: "Equipment shown is representative. Exact model may vary based on availability.",
  "bouncy castle": "Equipment shown is representative. Exact model may vary based on availability.",
}

export default function SupplierNote({ category, className = "" }) {
  if (!category) return null

  const note = CATEGORY_NOTES[category]
  if (!note) return null

  return (
    <p className={`text-xs text-gray-400 italic ${className}`}>
      * {note}
    </p>
  )
}

// Helper function to get note text directly (for inline use)
export function getSupplierNote(category) {
  if (!category) return null
  return CATEGORY_NOTES[category] || null
}

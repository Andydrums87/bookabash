import { Suspense } from "react"
import HomePageContent from "./HomePageContent"

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  )
}

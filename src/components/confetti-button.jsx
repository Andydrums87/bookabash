"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PartyPopper } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "@uidotdev/usehooks"

export default function ConfettiButton() {
  const [isCelebrating, setIsCelebrating] = useState(false)
  const { width, height } = useWindowSize()

  const handleClick = () => {
    setIsCelebrating(true)
    setTimeout(() => setIsCelebrating(false), 5000)
  }

  return (
    <>
      {isCelebrating && <Confetti width={width || 0} height={height || 0} recycle={false} numberOfPieces={400} />}
      <Button
        onClick={handleClick}
        className="bg-primary-500 hover:bg-primary-700 text-white font-bold shadow-lg transform hover:scale-105 transition-transform"
        size="lg"
      >
        <PartyPopper className="w-5 h-5 mr-2" />
        Book the Party!
      </Button>
    </>
  )
}

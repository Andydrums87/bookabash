"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import BudgetControls from "@/components/budget-controls"

export default function MobileBudgetBar({ 
  totalSpent = 0, 
  tempBudget = 600,
  budgetControlProps = {}
}) {
  const [isBudgetDrawerOpen, setIsBudgetDrawerOpen] = useState(false)

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 shadow-lg z-40 max-w-screen">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Budget</p>
          <p suppressHydrationWarning={true} className="font-semibold text-lg">
            £{totalSpent} <span className="text-sm text-muted-foreground">/ £{tempBudget}</span>
          </p>
        </div>
        
        <Drawer open={isBudgetDrawerOpen} onOpenChange={setIsBudgetDrawerOpen}>
          <DrawerTrigger asChild>
            <Button>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Adjust Budget
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Adjust Your Budget</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <BudgetControls {...budgetControlProps} />
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Done</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
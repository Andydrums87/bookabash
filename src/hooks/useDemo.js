"use client"
import { useSearchParams } from "next/navigation"

export function useDemo() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get("demo") === "1"

  return { isDemo }
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { UserMenu } from "./UserMenu"

export function AuthButtons({ initialUser }) {
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(!initialUser)

  useEffect(() => {
    // If we have initial user from server, no need to check again
    if (initialUser) {
      setLoading(false)
      return
    }

    // Check auth on client if no server user
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!error && user) {
          setUser({
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || null,
          })
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || null,
        } : null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [initialUser])

  if (loading) {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
  }

  if (user) {
    return <UserMenu initialUser={user} />
  }

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <Link href="/signin">Sign In</Link>
      </Button>
      <Button size="sm" className="bg-primary-500 hover:bg-primary-600" asChild>
        <Link href="/suppliers/onboarding">For Business</Link>
      </Button>
    </>
  )
}

export default AuthButtons

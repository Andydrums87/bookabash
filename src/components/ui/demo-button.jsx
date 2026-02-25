"use client"
import { useState, useRef } from "react"
import { Button } from "./button"

/**
 * DemoButton - Enhanced button with visual feedback for screen recording demos
 *
 * Features:
 * - Scale press animation (0.98 for 120ms)
 * - Tap ripple effect (white ring expanding from tap point)
 * - Loading state with "Building..." text
 * - Success flash with "Done ✓"
 */
export function DemoButton({
  children,
  onClick,
  disabled,
  className,
  loadingText = "Building...",
  successText = "Done ✓",
  loadingDuration = 800,
  successDuration = 400,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState([])
  const [buttonState, setButtonState] = useState("idle") // idle | loading | success
  const buttonRef = useRef(null)

  const createRipple = (e) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = {
      id: Date.now(),
      x,
      y,
    }

    setRipples((prev) => [...prev, ripple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 600)
  }

  const handlePress = (e) => {
    if (disabled || buttonState !== "idle") return

    // Create ripple effect
    createRipple(e)

    // Scale animation
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 120)
  }

  const handleClick = async (e) => {
    if (disabled || buttonState !== "idle") return

    handlePress(e)

    // Start loading state
    setButtonState("loading")

    // Wait for loading duration
    await new Promise((resolve) => setTimeout(resolve, loadingDuration))

    // Show success state
    setButtonState("success")

    // Wait for success duration then reset and trigger actual onClick
    await new Promise((resolve) => setTimeout(resolve, successDuration))

    setButtonState("idle")

    // Call the actual onClick handler after animations complete
    if (onClick) {
      onClick(e)
    }
  }

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {loadingText}
          </div>
        )
      case "success":
        return (
          <div className="flex items-center justify-center animate-pulse">
            <span className="text-lg mr-2">✓</span>
            {successText}
          </div>
        )
      default:
        return children
    }
  }

  return (
    <Button
      ref={buttonRef}
      type="button"
      disabled={disabled || buttonState !== "idle"}
      onClick={handleClick}
      className={`
        relative overflow-hidden
        transition-transform duration-100 ease-out
        ${isPressed ? "scale-[0.98]" : "scale-100"}
        ${className}
      `}
      style={{
        transform: isPressed ? "scale(0.98)" : "scale(1)",
        transition: "transform 120ms ease-out",
      }}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            className="block rounded-full bg-white/30 animate-demo-ripple"
            style={{
              width: "10px",
              height: "10px",
            }}
          />
        </span>
      ))}

      {/* Button content */}
      <span className="relative z-10">{getButtonContent()}</span>
    </Button>
  )
}

/**
 * DemoSubmitButton - Special version for form submit with demo animations
 * Triggers form submit after animations complete
 */
export function DemoSubmitButton({
  children,
  disabled,
  className,
  isSubmitting,
  onDemoComplete,
  loadingText = "Building...",
  successText = "Done ✓",
  loadingDuration = 800,
  successDuration = 400,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState([])
  const [demoState, setDemoState] = useState("idle") // idle | loading | success
  const buttonRef = useRef(null)

  const createRipple = (e) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = {
      id: Date.now(),
      x,
      y,
    }

    setRipples((prev) => [...prev, ripple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 600)
  }

  const handleClick = async (e) => {
    e.preventDefault()
    if (disabled || demoState !== "idle") return

    // Create ripple
    createRipple(e)

    // Scale press
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 120)

    // Loading state
    setDemoState("loading")
    await new Promise((resolve) => setTimeout(resolve, loadingDuration))

    // Success state
    setDemoState("success")
    await new Promise((resolve) => setTimeout(resolve, successDuration))

    // Reset and trigger actual submit
    setDemoState("idle")
    if (onDemoComplete) {
      onDemoComplete()
    }
  }

  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Building Your Party...
        </div>
      )
    }

    switch (demoState) {
      case "loading":
        return (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {loadingText}
          </div>
        )
      case "success":
        return (
          <div className="flex items-center justify-center animate-pulse">
            {successText}
          </div>
        )
      default:
        return children
    }
  }

  return (
    <Button
      ref={buttonRef}
      type="button"
      disabled={disabled || demoState !== "idle" || isSubmitting}
      onClick={handleClick}
      className={`
        relative overflow-hidden
        ${className}
      `}
      style={{
        transform: isPressed ? "scale(0.98)" : "scale(1)",
        transition: "transform 120ms ease-out",
      }}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            className="block rounded-full border-2 border-white/80 animate-demo-ripple"
            style={{
              width: "10px",
              height: "10px",
            }}
          />
        </span>
      ))}

      {/* Button content */}
      <span className="relative z-10">{getButtonContent()}</span>
    </Button>
  )
}

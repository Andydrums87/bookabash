"use client"
import { useState, useRef } from "react"

/**
 * DemoTapButton - Button with tap animations for demo mode screen recordings
 * Features: Scale press (0.96 for 100ms) + ripple effect
 */
export function DemoTapButton({
  children,
  onClick,
  className = "",
  rippleColor = "rgba(255, 255, 255, 0.5)",
  disabled = false,
  type = "button",
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState([])
  const buttonRef = useRef(null)

  const createRipple = (e) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = { id: Date.now(), x, y }
    setRipples((prev) => [...prev, ripple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 500)
  }

  const handleClick = (e) => {
    if (disabled) return
    createRipple(e)
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 100)
    if (onClick) onClick(e)
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
      style={{
        transform: isPressed ? "scale(0.96)" : "scale(1)",
        transition: "transform 100ms ease-out",
      }}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none z-20"
          style={{ left: ripple.x, top: ripple.y, transform: "translate(-50%, -50%)" }}
        >
          <span
            className="block rounded-full animate-demo-ripple"
            style={{ width: "10px", height: "10px", backgroundColor: rippleColor }}
          />
        </span>
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

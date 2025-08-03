"use client"

import React, { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Move, RotateCcw, Save } from "lucide-react"
import { themes } from "@/lib/themes"

const ReactDraggableInvite = ({ themeKey, inviteData, onLayoutSave }) => {
  const theme = themes[themeKey]
  const [editMode, setEditMode] = useState(false)
  const [positions, setPositions] = useState({})
  const [hasChanges, setHasChanges] = useState(false)
  const [dragState, setDragState] = useState({
    isDragging: false,
    dragKey: null,
    startPos: { x: 0, y: 0 },
    elementPos: { x: 0, y: 0 },
  })

  const containerRef = useRef(null)
  const dragRefs = useRef({})

  // RESPONSIVE CONTAINER DIMENSIONS
  const getContainerDimensions = () => {
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth
      if (screenWidth < 640) {
        // Mobile
        return { width: Math.min(300, screenWidth - 40), height: 400 }
      } else if (screenWidth < 1024) {
        // Tablet
        return { width: 350, height: 467 }
      }
    }
    // Desktop default
    return { width: 400, height: 533 }
  }

  const [containerDims, setContainerDims] = useState(getContainerDimensions())

  // Update dimensions on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setContainerDims(getContainerDimensions())
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Get initial position for elements
  const getInitialPosition = useCallback(
    (key) => {
      if (positions[key]) {
        return positions[key]
      }

      const style = theme.layoutConfig[key]
      if (style && style.left && style.top) {
        const leftPercent = Number.parseFloat(style.left) || 50
        const topPercent = Number.parseFloat(style.top) || 50
        return {
          leftPercent,
          topPercent,
          x: (leftPercent / 100) * containerDims.width - 100, // Offset for centering
          y: (topPercent / 100) * containerDims.height,
        }
      }

      // Default positions
      const defaults = {
        headline: {
          leftPercent: 50,
          topPercent: 18,
          x: containerDims.width * 0.5 - 100,
          y: containerDims.height * 0.18,
        },
        date: { leftPercent: 50, topPercent: 72, x: containerDims.width * 0.5 - 100, y: containerDims.height * 0.72 },
        time: { leftPercent: 50, topPercent: 76, x: containerDims.width * 0.5 - 100, y: containerDims.height * 0.76 },
        location: {
          leftPercent: 50,
          topPercent: 80,
          x: containerDims.width * 0.5 - 100,
          y: containerDims.height * 0.8,
        },
        message: {
          leftPercent: 50,
          topPercent: 85,
          x: containerDims.width * 0.5 - 100,
          y: containerDims.height * 0.85,
        },
      }

      return (
        defaults[key] || {
          leftPercent: 50,
          topPercent: 50,
          x: containerDims.width * 0.5 - 100,
          y: containerDims.height * 0.5,
        }
      )
    },
    [theme?.layoutConfig, positions, containerDims],
  )

  // Handle mouse down - start dragging
  const handleMouseDown = useCallback(
    (e, key) => {
      if (!editMode) return
      e.preventDefault()

      const rect = dragRefs.current[key]?.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!rect || !containerRect) return

      setDragState({
        isDragging: true,
        dragKey: key,
        startPos: {
          x: e.clientX,
          y: e.clientY,
        },
        elementPos: {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
        },
      })
    },
    [editMode],
  )

  // Handle mouse move - dragging
  const handleMouseMove = useCallback(
    (e) => {
      if (!dragState.isDragging || !dragState.dragKey || !containerRef.current) return
      e.preventDefault()

      const containerRect = containerRef.current.getBoundingClientRect()

      // Calculate new position
      const deltaX = e.clientX - dragState.startPos.x
      const deltaY = e.clientY - dragState.startPos.y
      const newX = dragState.elementPos.x + deltaX
      const newY = dragState.elementPos.y + deltaY

      // Convert to percentages with bounds checking
      const leftPercent = Math.max(5, Math.min(95, (newX / containerRect.width) * 100))
      const topPercent = Math.max(5, Math.min(95, (newY / containerRect.height) * 100))

      setPositions((prev) => ({
        ...prev,
        [dragState.dragKey]: {
          leftPercent,
          topPercent,
          x: newX,
          y: newY,
        },
      }))

      setHasChanges(true)
    },
    [dragState],
  )

  // Handle mouse up - stop dragging
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragKey: null,
      startPos: { x: 0, y: 0 },
      elementPos: { x: 0, y: 0 },
    })
  }, [])

  // Add global event listeners for drag
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp])

  const saveLayout = () => {
    if (onLayoutSave && Object.keys(positions).length > 0) {
      const newLayout = {}
      Object.entries(positions).forEach(([key, pos]) => {
        newLayout[key] = {
          ...theme.layoutConfig[key],
          left: `${pos.leftPercent}%`,
          top: `${pos.topPercent}%`,
        }
      })

      console.log("Saving layout:", newLayout)
      onLayoutSave(newLayout)
      setHasChanges(false)
      alert("✅ Layout saved!")
    }
  }

  const resetPositions = () => {
    setPositions({})
    setHasChanges(false)
  }

  const getTextContent = (key) => {
    const content = {
      headline: inviteData?.headlineText || `${inviteData?.childName || "Child"}'s Birthday`,
      date: inviteData?.formattedDate || inviteData?.date || "Party Date",
      time: inviteData?.time || "Party Time",
      location: inviteData?.venue || "Party Location",
      message: inviteData?.message || "Join us for fun!",
    }

    return content[key] || `${key} content`
  }

  // Get responsive font sizes
  const getResponsiveFontSize = (originalSize, key) => {
    if (typeof originalSize !== "string") return originalSize

    const size = Number.parseInt(originalSize)
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1024

    if (screenWidth < 640) {
      // Mobile
      if (key === "headline") return `${Math.max(16, size * 0.4)}px`
      return `${Math.max(10, size * 0.3)}px`
    } else if (screenWidth < 1024) {
      // Tablet
      if (key === "headline") return `${Math.max(20, size * 0.5)}px`
      return `${Math.max(12, size * 0.4)}px`
    }

    // Desktop - scale down from original
    if (key === "headline") return `${Math.max(24, size * 0.6)}px`
    return `${Math.max(14, size * 0.5)}px`
  }

  // Render text element
  const renderTextElement = (key, originalStyle) => {
    const content = getTextContent(key)
    const position = getInitialPosition(key)
    const isDragging = dragState.isDragging && dragState.dragKey === key

    // Apply birthday color highlighting
    const coloredContent =
      key === "headline" && inviteData?.birthdayColor && content.includes("Birthday") ? (
        <>
          {content.split("Birthday")[0]}
          <span style={{ color: inviteData.birthdayColor }}>Birthday</span>
          {content.split("Birthday")[1]}
        </>
      ) : (
        content
      )

    // Base style with responsive sizing
    const baseStyle = {
      fontSize: getResponsiveFontSize(originalStyle.fontSize, key),
      fontWeight: originalStyle.fontWeight,
      fontFamily: originalStyle.fontFamily,
      color: originalStyle.color,
      textShadow: originalStyle.textShadow,
      fontStyle: originalStyle.fontStyle,
      lineHeight: originalStyle.lineHeight,
      textAlign: "center",
      whiteSpace: key === "headline" ? "normal" : "nowrap",
      userSelect: editMode ? "none" : "auto",
      wordWrap: "break-word",
      maxWidth: key === "headline" ? "90%" : "auto",
      // Apply headline styles if available
      ...(key === "headline" && inviteData?.headlineStyles
        ? {
            fontSize: getResponsiveFontSize(inviteData.headlineStyles.fontSize, key),
            fontWeight: inviteData.headlineStyles.fontWeight,
            fontFamily: inviteData.headlineStyles.fontFamily,
            lineHeight: inviteData.headlineStyles.lineHeight,
          }
        : {}),
    }

    // Position style
    const positionStyle = {
      position: "absolute",
      left: `${position.leftPercent}%`,
      top: `${position.topPercent}%`,
      transform: "translateX(-50%)",
      cursor: editMode ? "grab" : "default",
      zIndex: isDragging ? 1000 : 1,
      ...(editMode && {
        padding: "4px 8px",
        borderRadius: "6px",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        border: "1px dashed #3b82f6",
        boxShadow: isDragging ? "0 4px 12px rgba(59, 130, 246, 0.5)" : "0 2px 6px rgba(59, 130, 246, 0.3)",
        minWidth: "80px",
        transition: isDragging ? "none" : "all 0.2s ease",
      }),
    }

    return (
      <div
        key={key}
        ref={(el) => (dragRefs.current[key] = el)}
        style={{ ...baseStyle, ...positionStyle }}
        onMouseDown={(e) => handleMouseDown(e, key)}
        title={editMode ? `Drag to move ${key}` : ""}
      >
        {coloredContent}
      </div>
    )
  }

  // Safety check
  if (!theme || !theme.layoutConfig) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-600">Error: Theme "{themeKey}" not found or invalid</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* Controls */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-medium text-sm sm:text-base">Layout Editor</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={editMode ? "default" : "outline"}
                onClick={() => setEditMode(!editMode)}
                className="text-xs sm:text-sm"
              >
                <Move className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {editMode ? "Exit Edit" : "Edit Layout"}
              </Button>
              {editMode && (
                <>
                  <Button size="sm" variant="outline" onClick={resetPositions}>
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  {hasChanges && (
                    <Button size="sm" onClick={saveLayout}>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Save
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {editMode && (
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-blue-800">
              <div className="font-medium mb-1">✨ Drag Mode Active</div>
              <div>Click and drag any blue outlined text to reposition it.</div>
            </div>
          )}

          {/* Debug info */}
          {editMode && Object.keys(positions).length > 0 && (
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
              <strong>Modified positions:</strong>
              {Object.entries(positions).map(([key, pos]) => (
                <div key={key}>
                  {key}: {pos.leftPercent.toFixed(1)}%, {pos.topPercent.toFixed(1)}%
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Container */}
      <div className="flex justify-center w-full">
        <div
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border shadow bg-gray-100 select-none"
          style={{
            width: `${containerDims.width}px`,
            height: `${containerDims.height}px`,
            maxWidth: "100%",
          }}
        >
          {/* Background Image */}
          <img
            src={theme.backgroundUrl || "/placeholder.svg"}
            alt={`${theme.name} Background`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ pointerEvents: "none" }}
            draggable={false}
          />

          {/* Overlay for better visibility in edit mode */}
          {editMode && <div className="absolute inset-0 bg-black/10 pointer-events-none" />}

          {/* Text Elements */}
          {Object.entries(theme.layoutConfig).map(([key, originalStyle]) => renderTextElement(key, originalStyle))}

          {/* Instructions */}
          {editMode && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded max-w-32 sm:max-w-48 pointer-events-none">
              <div className="font-medium mb-1">🖱️ Drag Mode</div>
              <div className="hidden sm:block">Click and drag blue text to move</div>
              <div className="sm:hidden">Drag blue text</div>
              {dragState.isDragging && <div className="mt-1 text-yellow-300">Moving: {dragState.dragKey}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReactDraggableInvite

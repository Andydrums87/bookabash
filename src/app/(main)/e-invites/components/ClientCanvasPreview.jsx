"use client"

import { useRef, useEffect, useState } from 'react'
import { TEMPLATE_CONFIGS, FONT_CONFIGS, formatDate } from '@/shared/canvasTemplateConfigs'

// Helper to measure text with letter spacing
function measureTextWithSpacing(ctx, text, letterSpacing) {
  if (!letterSpacing || letterSpacing === 0) {
    return ctx.measureText(text).width
  }
  let totalWidth = 0
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width + (i < text.length - 1 ? letterSpacing : 0)
  }
  return totalWidth
}

// Helper to draw text with letter spacing
function drawTextWithSpacing(ctx, text, x, y, letterSpacing, align) {
  if (!letterSpacing || letterSpacing === 0) {
    ctx.fillText(text, x, y)
    return
  }

  const totalWidth = measureTextWithSpacing(ctx, text, letterSpacing)
  let currentX = x
  if (align === 'center') currentX = x - totalWidth / 2
  else if (align === 'right') currentX = x - totalWidth

  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], currentX, y)
    currentX += ctx.measureText(text[i]).width + letterSpacing
  }
}

// Helper to stroke text with letter spacing
function strokeTextWithSpacing(ctx, text, x, y, letterSpacing, align) {
  if (!letterSpacing || letterSpacing === 0) {
    ctx.strokeText(text, x, y)
    return
  }

  const totalWidth = measureTextWithSpacing(ctx, text, letterSpacing)
  let currentX = x
  if (align === 'center') currentX = x - totalWidth / 2
  else if (align === 'right') currentX = x - totalWidth

  for (let i = 0; i < text.length; i++) {
    ctx.strokeText(text[i], currentX, y)
    currentX += ctx.measureText(text[i]).width + letterSpacing
  }
}

export default function ClientCanvasPreview({
  templateId,
  inviteData,
  width = 300,
  className = "",
  onLoad
}) {
  const canvasRef = useRef(null)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [bgImage, setBgImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const config = TEMPLATE_CONFIGS[templateId]

  // Calculate scale factor for preview
  const scale = config ? width / config.width : 1
  const height = config ? Math.round(config.height * scale) : Math.round(width * 1.5)

  // Load fonts on mount
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const loadPromises = FONT_CONFIGS.map(async (fontConfig) => {
          try {
            const fontFace = new FontFace(
              fontConfig.family,
              `url(${fontConfig.url})`,
              { weight: fontConfig.weight }
            )
            await fontFace.load()
            document.fonts.add(fontFace)
            return true
          } catch (err) {
            console.warn(`Failed to load font ${fontConfig.family}:`, err.message)
            return false
          }
        })

        await Promise.all(loadPromises)
        setFontsLoaded(true)
      } catch (err) {
        console.error('Font loading error:', err)
        setFontsLoaded(true) // Continue anyway with fallback fonts
      }
    }

    loadFonts()
  }, [])

  // Load background image when template changes
  useEffect(() => {
    if (!config) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setBgImage(img)
      setIsLoading(false)
    }
    img.onerror = () => {
      console.error('Failed to load background:', config.background)
      setIsLoading(false)
    }
    img.src = config.background
  }, [templateId, config])

  // Render canvas when everything is ready
  useEffect(() => {
    if (!canvasRef.current || !fontsLoaded || !bgImage || !config) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Clear and draw background
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(bgImage, 0, 0, width, height)

    // Prepare text data
    const textData = {
      name: inviteData?.childName || 'NAME',
      turns: 'TURNS',
      age: inviteData?.age || '0',
      dateTime: inviteData?.date
        ? `${formatDate(inviteData.date)} ${inviteData.time || ''}`
        : 'Date & Time',
      venue: inviteData?.venue || 'Venue Address'
    }

    // Draw each text zone
    config.textZones.forEach(zone => {
      // Get text for this zone
      let text = zone.text || textData[zone.id] || ''
      if (!text) return

      // Apply transform
      if (zone.transform === 'uppercase') {
        text = text.toUpperCase()
      } else if (zone.transform === 'lowercase') {
        text = text.toLowerCase()
      }

      // Scale coordinates and font size
      const scaledX = zone.x * scale
      const scaledY = zone.y * scale
      let scaledFontSize = zone.fontSize * scale
      const letterSpacing = (zone.letterSpacing || 0) * scale
      const rotation = zone.rotation || 0

      // Auto-scale if needed
      if (zone.autoScale && zone.maxWidth > 0) {
        const scaledMaxWidth = zone.maxWidth * scale
        ctx.font = `${zone.fontWeight || 'normal'} ${scaledFontSize}px "${zone.font}", Arial, sans-serif`
        let textWidth = measureTextWithSpacing(ctx, text, letterSpacing)

        const minFontSize = (zone.minFontSize || 60) * scale
        while (textWidth > scaledMaxWidth && scaledFontSize > minFontSize) {
          scaledFontSize -= scale
          ctx.font = `${zone.fontWeight || 'normal'} ${scaledFontSize}px "${zone.font}", Arial, sans-serif`
          textWidth = measureTextWithSpacing(ctx, text, letterSpacing)
        }
      }

      // Set font
      ctx.font = `${zone.fontWeight || 'normal'} ${scaledFontSize}px "${zone.font}", Arial, sans-serif`
      ctx.textAlign = letterSpacing ? 'left' : (zone.align || 'center')
      ctx.textBaseline = 'middle'

      // Scale stroke width
      const scaledStrokeWidth = zone.strokeWidth ? zone.strokeWidth * scale : 0

      // Save context for rotation
      ctx.save()

      // Apply rotation
      if (rotation !== 0) {
        ctx.translate(scaledX, scaledY)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-scaledX, -scaledY)
      }

      // Handle multiline text
      if (zone.multiline && zone.maxWidth > 0) {
        const scaledMaxWidth = zone.maxWidth * scale
        const lineHeight = (zone.lineHeight || 1.2) * scaledFontSize
        const words = text.split(' ')
        const lines = []
        let currentLine = ''

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          const testWidth = ctx.measureText(testLine).width
          if (testWidth > scaledMaxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) lines.push(currentLine)

        const totalHeight = lines.length * lineHeight
        let currentY = scaledY - totalHeight / 2 + lineHeight / 2

        lines.forEach(line => {
          if (scaledStrokeWidth > 0 && zone.strokeColor) {
            ctx.strokeStyle = zone.strokeColor
            ctx.lineWidth = scaledStrokeWidth
            ctx.lineJoin = 'round'
            ctx.strokeText(line, scaledX, currentY)
          }
          ctx.fillStyle = zone.color
          ctx.fillText(line, scaledX, currentY)
          currentY += lineHeight
        })
      } else {
        // Single line text
        if (scaledStrokeWidth > 0 && zone.strokeColor) {
          ctx.strokeStyle = zone.strokeColor
          ctx.lineWidth = scaledStrokeWidth
          ctx.lineJoin = 'round'
          strokeTextWithSpacing(ctx, text, scaledX, scaledY, letterSpacing, zone.align)
        }
        ctx.fillStyle = zone.color
        drawTextWithSpacing(ctx, text, scaledX, scaledY, letterSpacing, zone.align)
      }

      // Restore context
      ctx.restore()
    })

    // Notify parent that rendering is complete
    if (onLoad) onLoad()

  }, [fontsLoaded, bgImage, inviteData, config, width, height, scale, onLoad])

  if (!config) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Template not found</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`rounded-lg shadow-md ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ width, height }}
      />
    </div>
  )
}

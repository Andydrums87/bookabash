"use client"

import { useState, useRef, useEffect } from 'react'

// Default config matching the server route.js
// Note: 'text' property overrides the dynamic textData value (use for static text like "TURNS" or "IS TURNING")
const DEFAULT_CONFIG = {
  name: {
    x: 375, y: 339, fontSize: 177,
    font: 'Impact', fontWeight: 'bold',
    color: '#FFD700', strokeColor: '#000000', strokeWidth: 4,
    align: 'center', transform: 'uppercase',
    maxWidth: 800, multiline: false, lineHeight: 1.2,
    autoScale: true, minFontSize: 80,
    letterSpacing: 0,
    rotation: 0,  // Rotation in degrees
    text: ''  // Empty = use dynamic textData.name
  },
  turns: {
    x: 414, y: 471, fontSize: 102,
    font: 'Impact', fontWeight: 'bold',
    color: '#000000', strokeColor: '#FFD700', strokeWidth: 2,
    align: 'right', transform: 'uppercase',
    maxWidth: 0, multiline: false, lineHeight: 1.2,
    letterSpacing: 0,
    rotation: 0,
    text: ''  // Empty = use dynamic textData.turns (e.g., "TURNS"), or set to "IS TURNING" for mermaid
  },
  age: {
    x: 424, y: 500, fontSize: 181,
    font: 'Impact', fontWeight: 'bold',
    color: '#000000', strokeColor: '#FFD700', strokeWidth: 10,
    align: 'center', transform: 'none',
    maxWidth: 0, multiline: false, lineHeight: 1.2,
    letterSpacing: 0,
    rotation: 0,
    text: ''
  },
  dateTime: {
    x: 424, y: 726, fontSize: 36,
    font: 'Impact', fontWeight: 'bold',
    color: '#333333', strokeColor: '', strokeWidth: 0,
    align: 'center', transform: 'none',
    maxWidth: 0, multiline: false, lineHeight: 1.2,
    letterSpacing: 0,
    rotation: 0,
    text: ''
  },
  venue: {
    x: 424, y: 794, fontSize: 26,
    font: 'Impact', fontWeight: 'bold',
    color: '#444444', strokeColor: '', strokeWidth: 0,
    align: 'center', transform: 'none',
    maxWidth: 370, multiline: true, lineHeight: 1.3,
    letterSpacing: 0,
    rotation: 0,
    text: ''
  },
}

// Fonts available for selection - Google Fonts are loaded via FontFace API
const FONT_OPTIONS = ['Kpop Demon Hunter', 'Spicy Sale', 'Ice Kingdom', 'Cormorant Garamond', 'Princess Sofia', 'Bangers', 'Coiny', 'Lilita One', 'Bagel Fat One', 'Baloo 2', 'Luckiest Guy', 'Orbitron', 'Audiowide', 'Fredoka', 'Montserrat', 'Nunito', 'Impact', 'Arial', 'Georgia', 'Verdana', 'Times New Roman', 'Courier New']

// Google Fonts that need to be loaded for canvas rendering
// This list is used for the font status indicator
const GOOGLE_FONTS_TO_LOAD = [
  { family: 'Kpop Demon Hunter', weights: ['400'] },
  { family: 'Spicy Sale', weights: ['400'] },
  { family: 'Ice Kingdom', weights: ['400'] },
  { family: 'Cormorant Garamond', weights: ['400', '700'] },
  { family: 'Princess Sofia', weights: ['400'] },
  { family: 'Coiny', weights: ['400'] },
  { family: 'Lilita One', weights: ['400'] },
  { family: 'Baloo 2', weights: ['400', '800'] },
  { family: 'Bagel Fat One', weights: ['400'] },
  { family: 'Bangers', weights: ['400'] },
  { family: 'Luckiest Guy', weights: ['400'] },
  { family: 'Orbitron', weights: ['400'] },
  { family: 'Audiowide', weights: ['400'] },
  { family: 'Fredoka', weights: ['700'] },
  { family: 'Montserrat', weights: ['400', '700'] },
  { family: 'Nunito', weights: ['400', '900'] },
]
const WEIGHT_OPTIONS = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const ALIGN_OPTIONS = ['left', 'center', 'right']
const TRANSFORM_OPTIONS = ['none', 'uppercase', 'lowercase', 'capitalize']

// Available background templates
const BACKGROUND_OPTIONS = [
  { id: 'superhero', label: 'Superhero', path: '/invite-backgrounds/superhero.png' },
  { id: 'mermaid', label: 'Mermaid', path: '/invite-backgrounds/mermaid.png' },
  { id: 'pirate', label: 'Pirate', path: '/invite-backgrounds/pirate.png' },
  { id: 'princess', label: 'Princess', path: '/invite-backgrounds/princess.png' },
  { id: 'dinosaur', label: 'Dinosaur', path: '/invite-backgrounds/dinosaur.png' },
  { id: 'science', label: 'Science', path: '/invite-backgrounds/science.png' },
  { id: 'unicorn', label: 'Unicorn', path: '/invite-backgrounds/unicorn.png' },
  { id: 'football', label: 'Football', path: '/invite-backgrounds/football.png' },
  { id: 'space', label: 'Space', path: '/invite-backgrounds/space.png' },
  { id: 'spiderman', label: 'Spiderman', path: '/invite-backgrounds/spiderman.png' },
  { id: 'safari', label: 'Safari', path: '/invite-backgrounds/safari.png' },
  { id: 'frozen', label: 'Frozen', path: '/invite-backgrounds/frozen.png' },
  { id: 'kpop', label: 'K-Pop Demon Hunters', path: '/invite-backgrounds/kpop.png' },
]

export default function CanvasEditorPage() {
  const canvasRef = useRef(null)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [bgImage, setBgImage] = useState(null)
  const [selectedBg, setSelectedBg] = useState('superhero')
  const [canvasSize, setCanvasSize] = useState({ width: 848, height: 1216 })
  const [fontsLoaded, setFontsLoaded] = useState(false)

  // Text content
  const [textData, setTextData] = useState({
    name: 'BAILEY',
    turns: 'TURNS',
    age: '10',
    dateTime: 'June 20, 2028 | 2pm - 4pm',
    venue: 'Redbourne Village Hall, 63 High St, Redbourn, St Albans AL3 7LW'
  })

  // Text zone configs
  const [zones, setZones] = useState(DEFAULT_CONFIG)

  // Currently selected zone for editing
  const [selectedZone, setSelectedZone] = useState('name')

  // Load Google Fonts for canvas rendering using FontFace API
  useEffect(() => {
    const loadFonts = async () => {
      try {
        console.log('🔄 Starting font loading...')

        // Define fonts with their Google Fonts URLs (fetched from Google Fonts CSS API)
        const fontConfigs = [
          // Cormorant Garamond - elegant serif
          { family: 'Cormorant Garamond', url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjoq3FNsS8.woff2', weight: '400' },
          // Princess Sofia - script font
          { family: 'Princess Sofia', url: 'https://fonts.gstatic.com/s/princesssofia/v27/qWczB6yguIb8DZ_GXZst16n7GRz-mDMouw.woff2', weight: '400' },
          // Coiny - playful rounded
          { family: 'Coiny', url: 'https://fonts.gstatic.com/s/coiny/v17/gyByhwU1K989PXweElKvOg.woff2', weight: '400' },
          // Bagel Fat One - playful rounded
          { family: 'Bagel Fat One', url: 'https://fonts.gstatic.com/s/bagelfatone/v2/hYkPPucsQOr5dy02WmQr5Zkd0BtmuP0c.woff2', weight: '400' },
          // Lilita One - bold rounded
          { family: 'Lilita One', url: 'https://fonts.gstatic.com/s/lilitaone/v17/i7dPIFZ9Zz-WBtRtedDbUEN2Qlq6.woff2', weight: '400' },
          // Bangers - comic style
          { family: 'Bangers', url: 'https://fonts.gstatic.com/s/bangers/v25/FeVQS0BTqb0h60ACL5xa37xj.woff2', weight: '400' },
          // Baloo 2 - variable font
          { family: 'Baloo 2', url: 'https://fonts.gstatic.com/s/baloo2/v23/wXKrE3kTposypRyd11rWB-wq.woff2', weight: '400 800' },
          // Montserrat - variable font
          { family: 'Montserrat', url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm45xWtrzAbj.woff2', weight: '400 700' },
          // Nunito - variable font
          { family: 'Nunito', url: 'https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKof4N-yGbss.woff2', weight: '400 900' },
          // Luckiest Guy - playful bold display
          { family: 'Luckiest Guy', url: 'https://fonts.gstatic.com/s/luckiestguy/v25/_gP_1RrxsjcxVyin9l9n_j2RT9RxqDs.woff2', weight: '400' },
          // Orbitron - futuristic/space font
          { family: 'Orbitron', url: 'https://fonts.gstatic.com/s/orbitron/v35/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgzfDAlp7lk.woff2', weight: '400' },
          // Audiowide - futuristic/tech font
          { family: 'Audiowide', url: 'https://fonts.gstatic.com/s/audiowide/v22/l7gdbjpo0cum0ckerWCdmA_OMRlABolM.woff2', weight: '400' },
          // Fredoka - rounded playful font
          { family: 'Fredoka', url: 'https://fonts.gstatic.com/s/fredoka/v17/X7nP4b87HvSqjb_WIi2yDCRwoQ_k7367_B-i2yQag0-mac3OFiX8E-mKttxNbiktb9I.woff2', weight: '700' },
          // Ice Kingdom - icy/frozen style font (local file)
          { family: 'Ice Kingdom', url: '/fonts/Icekingdom.ttf', weight: '400' },
          // Spicy Sale - whimsical unicorn/fantasy font (local file)
          { family: 'Spicy Sale', url: '/fonts/SpicySale.ttf', weight: '400' },
          // Kpop Demon Hunter - stylized K-pop themed font (local file)
          { family: 'Kpop Demon Hunter', url: '/fonts/KpopDemonHunter.ttf', weight: '400' },
        ]

        const loadedFonts = []

        for (const config of fontConfigs) {
          try {
            const fontFace = new FontFace(
              config.family,
              `url(${config.url})`,
              { weight: config.weight || '400', style: 'normal' }
            )

            const loadedFont = await fontFace.load()
            document.fonts.add(loadedFont)
            loadedFonts.push(config.family)
            console.log(`✅ Loaded: ${config.family}`)
          } catch (fontErr) {
            console.warn(`⚠️ Failed to load ${config.family}:`, fontErr.message)
          }
        }

        // Wait for all fonts to be ready
        await document.fonts.ready

        // Verify fonts are available
        console.log('📋 Checking font availability:')
        for (const config of fontConfigs) {
          const isAvailable = document.fonts.check(`48px "${config.family}"`)
          console.log(`   ${config.family}: ${isAvailable ? '✅' : '❌'}`)
        }

        console.log(`✅ Font loading complete. Loaded: ${loadedFonts.join(', ')}`)
        setFontsLoaded(true)
      } catch (err) {
        console.warn('⚠️ Font loading error:', err)
        setFontsLoaded(true) // Continue anyway with fallback fonts
      }
    }

    loadFonts()
  }, [])

  // Load background image
  useEffect(() => {
    const bgOption = BACKGROUND_OPTIONS.find(bg => bg.id === selectedBg)
    if (!bgOption) return

    setBgLoaded(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setBgImage(img)
      setCanvasSize({ width: img.naturalWidth, height: img.naturalHeight })
      setBgLoaded(true)
    }
    img.onerror = () => {
      console.warn(`Background not found: ${bgOption.path}`)
      setBgLoaded(false)
    }
    img.src = bgOption.path
  }, [selectedBg])

  // Helper function to draw text with letter spacing
  const drawTextWithSpacing = (ctx, text, x, y, letterSpacing, align) => {
    if (!letterSpacing || letterSpacing === 0) {
      // No letter spacing - use normal drawing
      ctx.fillText(text, x, y)
      return
    }

    // Calculate total width with letter spacing
    let totalWidth = 0
    for (let i = 0; i < text.length; i++) {
      totalWidth += ctx.measureText(text[i]).width + (i < text.length - 1 ? letterSpacing : 0)
    }

    // Calculate starting x based on alignment
    let currentX = x
    if (align === 'center') {
      currentX = x - totalWidth / 2
    } else if (align === 'right') {
      currentX = x - totalWidth
    }

    // Draw each character
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], currentX, y)
      currentX += ctx.measureText(text[i]).width + letterSpacing
    }
  }

  // Helper function to stroke text with letter spacing
  const strokeTextWithSpacing = (ctx, text, x, y, letterSpacing, align) => {
    if (!letterSpacing || letterSpacing === 0) {
      ctx.strokeText(text, x, y)
      return
    }

    let totalWidth = 0
    for (let i = 0; i < text.length; i++) {
      totalWidth += ctx.measureText(text[i]).width + (i < text.length - 1 ? letterSpacing : 0)
    }

    let currentX = x
    if (align === 'center') {
      currentX = x - totalWidth / 2
    } else if (align === 'right') {
      currentX = x - totalWidth
    }

    for (let i = 0; i < text.length; i++) {
      ctx.strokeText(text[i], currentX, y)
      currentX += ctx.measureText(text[i]).width + letterSpacing
    }
  }

  // Calculate text width with letter spacing
  const measureTextWithSpacing = (ctx, text, letterSpacing) => {
    if (!letterSpacing || letterSpacing === 0) {
      return ctx.measureText(text).width
    }
    let totalWidth = 0
    for (let i = 0; i < text.length; i++) {
      totalWidth += ctx.measureText(text[i]).width + (i < text.length - 1 ? letterSpacing : 0)
    }
    return totalWidth
  }

  // Draw canvas whenever anything changes
  useEffect(() => {
    if (!bgLoaded || !canvasRef.current || !bgImage || !fontsLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height)

    // Draw each text zone
    Object.entries(zones).forEach(([id, zone]) => {
      // Use zone.text if set (static override), otherwise use dynamic textData
      const text = zone.text || textData[id]
      if (!text) return

      // Apply transform
      let displayText = text
      if (zone.transform === 'uppercase') displayText = text.toUpperCase()
      else if (zone.transform === 'lowercase') displayText = text.toLowerCase()
      else if (zone.transform === 'capitalize') displayText = text.replace(/\b\w/g, c => c.toUpperCase())

      const letterSpacing = zone.letterSpacing || 0
      const rotation = zone.rotation || 0

      // Calculate actual font size (auto-scale if enabled)
      let actualFontSize = zone.fontSize
      const minFontSize = zone.minFontSize || 60

      if (zone.autoScale && zone.maxWidth > 0) {
        // Start with configured font size and scale down if needed
        ctx.font = `${zone.fontWeight} ${zone.fontSize}px "${zone.font}", Arial, sans-serif`
        let textWidth = measureTextWithSpacing(ctx, displayText, letterSpacing)

        // Scale down until text fits within maxWidth or we hit minFontSize
        while (textWidth > zone.maxWidth && actualFontSize > minFontSize) {
          actualFontSize -= 5
          ctx.font = `${zone.fontWeight} ${actualFontSize}px "${zone.font}", Arial, sans-serif`
          textWidth = measureTextWithSpacing(ctx, displayText, letterSpacing)
        }
      }

      // Set final font
      ctx.font = `${zone.fontWeight} ${actualFontSize}px "${zone.font}", Arial, sans-serif`
      ctx.textAlign = letterSpacing ? 'left' : (zone.align || 'center') // Use left for manual spacing
      ctx.textBaseline = 'middle'

      // Scale stroke width proportionally
      const scaledStrokeWidth = zone.strokeWidth ? Math.round(zone.strokeWidth * (actualFontSize / zone.fontSize)) : 0

      // Save context for rotation
      ctx.save()

      // Apply rotation around the text position
      if (rotation !== 0) {
        ctx.translate(zone.x, zone.y)
        ctx.rotate((rotation * Math.PI) / 180) // Convert degrees to radians
        ctx.translate(-zone.x, -zone.y)
      }

      if (zone.multiline && zone.maxWidth > 0 && !zone.autoScale) {
        // Handle multiline text
        const words = displayText.split(' ')
        const lines = []
        let currentLine = ''

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          const metrics = ctx.measureText(testLine)
          if (metrics.width > zone.maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) lines.push(currentLine)

        const totalHeight = lines.length * actualFontSize * zone.lineHeight
        let startY = zone.y - totalHeight / 2 + actualFontSize / 2

        for (const line of lines) {
          if (zone.strokeColor && scaledStrokeWidth) {
            ctx.strokeStyle = zone.strokeColor
            ctx.lineWidth = scaledStrokeWidth
            ctx.lineJoin = 'round'
            strokeTextWithSpacing(ctx, line, zone.x, startY, letterSpacing, zone.align)
          }
          ctx.fillStyle = zone.color
          drawTextWithSpacing(ctx, line, zone.x, startY, letterSpacing, zone.align)
          startY += actualFontSize * zone.lineHeight
        }
      } else {
        // Single line (or auto-scaled text)
        if (zone.strokeColor && scaledStrokeWidth) {
          ctx.strokeStyle = zone.strokeColor
          ctx.lineWidth = scaledStrokeWidth
          ctx.lineJoin = 'round'
          strokeTextWithSpacing(ctx, displayText, zone.x, zone.y, letterSpacing, zone.align)
        }
        ctx.fillStyle = zone.color
        drawTextWithSpacing(ctx, displayText, zone.x, zone.y, letterSpacing, zone.align)
      }

      // Draw selection indicator if selected (before restoring rotation)
      if (id === selectedZone) {
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        const textWidth = measureTextWithSpacing(ctx, displayText, letterSpacing)
        let boxX = zone.x - textWidth / 2
        if (zone.align === 'left') boxX = zone.x
        if (zone.align === 'right') boxX = zone.x - textWidth
        ctx.strokeRect(boxX - 5, zone.y - actualFontSize / 2 - 5, textWidth + 10, actualFontSize + 10)
        ctx.setLineDash([])
      }

      // Restore context after rotation
      ctx.restore()
    })
  }, [bgLoaded, bgImage, zones, textData, selectedZone, fontsLoaded])

  // Update a zone property
  const updateZone = (id, prop, value) => {
    setZones(prev => ({
      ...prev,
      [id]: { ...prev[id], [prop]: value }
    }))
  }

  // Handle canvas click to select zone
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    for (const [id, zone] of Object.entries(zones)) {
      const text = textData[id]
      if (!text) continue

      const fontSize = zone.fontSize
      const estimatedWidth = text.length * fontSize * 0.6
      let left = zone.x - estimatedWidth / 2
      if (zone.align === 'left') left = zone.x
      if (zone.align === 'right') left = zone.x - estimatedWidth

      if (x >= left && x <= left + estimatedWidth &&
          y >= zone.y - fontSize / 2 && y <= zone.y + fontSize / 2) {
        setSelectedZone(id)
        return
      }
    }
  }

  // Generate config JSON for copying to route.js
  const generateConfig = () => {
    const config = Object.entries(zones).map(([id, zone]) => {
      let configStr = `      {
        id: '${id}',`

      // Add static text if set
      if (zone.text) {
        configStr += `
        text: '${zone.text}',`
      }

      configStr += `
        x: ${zone.x},
        y: ${zone.y},
        fontSize: ${zone.fontSize},
        font: '${zone.font}',
        fontWeight: '${zone.fontWeight}',
        color: '${zone.color}',`

      if (zone.strokeColor) {
        configStr += `
        strokeColor: '${zone.strokeColor}',
        strokeWidth: ${zone.strokeWidth},`
      }

      configStr += `
        align: '${zone.align}'`

      if (zone.transform && zone.transform !== 'none') {
        configStr += `,
        transform: '${zone.transform}'`
      }

      if (zone.letterSpacing && zone.letterSpacing !== 0) {
        configStr += `,
        letterSpacing: ${zone.letterSpacing}`
      }

      if (zone.rotation && zone.rotation !== 0) {
        configStr += `,
        rotation: ${zone.rotation}`
      }

      if (zone.autoScale) {
        configStr += `,
        maxWidth: ${zone.maxWidth || 800},
        minFontSize: ${zone.minFontSize || 60},
        autoScale: true`
      } else if (zone.multiline) {
        configStr += `,
        maxWidth: ${zone.maxWidth},
        multiline: true,
        lineHeight: ${zone.lineHeight}`
      }

      configStr += `
      }`
      return configStr
    }).join(',\n')
    return `textZones: [\n${config}\n    ]`
  }

  const current = zones[selectedZone]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Canvas Invite Editor (Real-time)</h1>
        <a href="/test-canvas-api" className="text-blue-400 hover:text-blue-300 text-sm">
          → Test Server API
        </a>
      </div>

      <div className="flex gap-6">
        {/* Canvas Preview */}
        <div className="flex-shrink-0">
          <div className="bg-gray-800 p-2 rounded-lg">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onClick={handleCanvasClick}
              className="cursor-pointer"
              style={{ width: canvasSize.width / 2, height: canvasSize.height / 2 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Click on text to select it | Canvas: {canvasSize.width}x{canvasSize.height}px</p>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
          {/* Font Status */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Font Status</h2>
              <span className={`text-xs px-2 py-1 rounded ${fontsLoaded ? 'bg-green-600' : 'bg-yellow-600'}`}>
                {fontsLoaded ? 'Loaded' : 'Loading...'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 text-xs">
              {GOOGLE_FONTS_TO_LOAD.map(font => {
                const isLoaded = typeof document !== 'undefined' && document.fonts?.check?.(`48px "${font.family}"`)
                return (
                  <span
                    key={font.family}
                    className={`px-2 py-0.5 rounded ${isLoaded ? 'bg-green-700' : 'bg-red-700'}`}
                    style={{ fontFamily: `"${font.family}", sans-serif` }}
                  >
                    {font.family}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Background Selector */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Template Background</h2>
            <select
              value={selectedBg}
              onChange={(e) => setSelectedBg(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              {BACKGROUND_OPTIONS.map(bg => (
                <option key={bg.id} value={bg.id}>{bg.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Theme: {selectedBg}</p>
          </div>

          {/* Zone Selector */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Select Zone</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(zones).map(id => (
                <button
                  key={id}
                  onClick={() => setSelectedZone(id)}
                  className={`px-3 py-1 rounded text-sm ${selectedZone === id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Text Content: {selectedZone}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Preview Text (dynamic - from user input)</label>
                <input
                  type="text"
                  value={textData[selectedZone]}
                  onChange={(e) => setTextData(prev => ({ ...prev, [selectedZone]: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  placeholder="Sample text for preview..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Static Text Override (optional - baked into template)</label>
                <input
                  type="text"
                  value={current.text || ''}
                  onChange={(e) => updateZone(selectedZone, 'text', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  placeholder="e.g., 'IS TURNING' or leave empty for dynamic"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {current.text ? `Using static: "${current.text}"` : 'Using dynamic preview text'}
                </p>
              </div>
            </div>
          </div>

          {/* Position & Size */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-3">Position & Size</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">X: {current.x}</label>
                <input type="range" min={0} max={canvasSize.width} value={current.x}
                  onChange={(e) => updateZone(selectedZone, 'x', parseInt(e.target.value))}
                  className="w-full h-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Y: {current.y}</label>
                <input type="range" min={0} max={canvasSize.height} value={current.y}
                  onChange={(e) => updateZone(selectedZone, 'y', parseInt(e.target.value))}
                  className="w-full h-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Font Size: {current.fontSize}</label>
                <input type="range" min={10} max={500} value={current.fontSize}
                  onChange={(e) => updateZone(selectedZone, 'fontSize', parseInt(e.target.value))}
                  className="w-full h-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Stroke Width: {current.strokeWidth}</label>
                <input type="range" min={0} max={15} value={current.strokeWidth}
                  onChange={(e) => updateZone(selectedZone, 'strokeWidth', parseInt(e.target.value))}
                  className="w-full h-2"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400">Letter Spacing: {current.letterSpacing || 0}px</label>
                <input type="range" min={-10} max={50} value={current.letterSpacing || 0}
                  onChange={(e) => updateZone(selectedZone, 'letterSpacing', parseInt(e.target.value))}
                  className="w-full h-2"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400">Rotation: {current.rotation || 0}°</label>
                <div className="flex gap-2 items-center">
                  <input type="range" min={-180} max={180} value={current.rotation || 0}
                    onChange={(e) => updateZone(selectedZone, 'rotation', parseInt(e.target.value))}
                    className="flex-1 h-2"
                  />
                  <button
                    onClick={() => updateZone(selectedZone, 'rotation', 0)}
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                    title="Reset rotation"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Font Settings */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-3">Font Settings</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Font Family</label>
                <select value={current.font}
                  onChange={(e) => updateZone(selectedZone, 'font', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Font Weight</label>
                <select value={current.fontWeight}
                  onChange={(e) => updateZone(selectedZone, 'fontWeight', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  {WEIGHT_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Text Align</label>
                <div className="flex gap-1 mt-1">
                  {ALIGN_OPTIONS.map(a => (
                    <button key={a} onClick={() => updateZone(selectedZone, 'align', a)}
                      className={`px-2 py-1 rounded text-xs flex-1 ${current.align === a ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400">Transform</label>
                <select value={current.transform}
                  onChange={(e) => updateZone(selectedZone, 'transform', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  {TRANSFORM_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-3">Colors</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Fill Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={current.color}
                    onChange={(e) => updateZone(selectedZone, 'color', e.target.value)}
                    className="w-10 h-8 rounded"
                  />
                  <input type="text" value={current.color}
                    onChange={(e) => updateZone(selectedZone, 'color', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400">Stroke Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={current.strokeColor || '#000000'}
                    onChange={(e) => updateZone(selectedZone, 'strokeColor', e.target.value)}
                    className="w-10 h-8 rounded"
                  />
                  <input type="text" value={current.strokeColor || ''}
                    onChange={(e) => updateZone(selectedZone, 'strokeColor', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                    placeholder="none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auto Scale Settings */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-3">Auto Scale (for long names)</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={current.autoScale || false}
                  onChange={(e) => updateZone(selectedZone, 'autoScale', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Enable auto-scaling</span>
              </label>
              {current.autoScale && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Max Width: {current.maxWidth}</label>
                    <input type="range" min={200} max={canvasSize.width} value={current.maxWidth || 800}
                      onChange={(e) => updateZone(selectedZone, 'maxWidth', parseInt(e.target.value))}
                      className="w-full h-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Min Font Size: {current.minFontSize || 60}</label>
                    <input type="range" min={30} max={150} value={current.minFontSize || 60}
                      onChange={(e) => updateZone(selectedZone, 'minFontSize', parseInt(e.target.value))}
                      className="w-full h-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Multiline Settings */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-3">Multiline / Wrapping</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={current.multiline}
                  onChange={(e) => updateZone(selectedZone, 'multiline', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Enable multiline wrapping</span>
              </label>
              {current.multiline && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Max Width: {current.maxWidth}</label>
                    <input type="range" min={100} max={800} value={current.maxWidth}
                      onChange={(e) => updateZone(selectedZone, 'maxWidth', parseInt(e.target.value))}
                      className="w-full h-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Line Height: {current.lineHeight}</label>
                    <input type="range" min={0.8} max={2} step={0.1} value={current.lineHeight}
                      onChange={(e) => updateZone(selectedZone, 'lineHeight', parseFloat(e.target.value))}
                      className="w-full h-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Import/Export Config */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Import / Export Config</h2>

            {/* Import Section */}
            <div className="mb-4 p-3 bg-gray-700 rounded">
              <p className="text-xs text-gray-400 mb-2">Paste textZones array from route.js:</p>
              <textarea
                id="importConfig"
                placeholder={`Paste your textZones config here, e.g.:\n[\n  { id: 'name', x: 512, y: 340, ... },\n  ...\n]`}
                className="w-full h-32 bg-gray-900 text-yellow-400 font-mono text-xs p-2 rounded"
              />
              <button
                onClick={() => {
                  try {
                    const input = document.getElementById('importConfig').value
                    // Extract array content - handle both textZones: [...] and just [...]
                    let arrayContent = input
                    if (input.includes('textZones:')) {
                      arrayContent = input.replace(/textZones:\s*/, '').trim()
                    }
                    // Convert JS object syntax to JSON (handle unquoted keys)
                    const jsonified = arrayContent
                      .replace(/(\w+):/g, '"$1":')  // quote keys
                      .replace(/'/g, '"')           // single to double quotes
                      .replace(/,\s*}/g, '}')       // trailing commas in objects
                      .replace(/,\s*\]/g, ']')      // trailing commas in arrays

                    const parsed = JSON.parse(jsonified)

                    if (Array.isArray(parsed)) {
                      const newZones = {}
                      parsed.forEach(zone => {
                        newZones[zone.id] = {
                          text: zone.text || '',  // Static text override
                          x: zone.x || 0,
                          y: zone.y || 0,
                          fontSize: zone.fontSize || 40,
                          font: zone.font || 'Impact',
                          fontWeight: zone.fontWeight || 'bold',
                          color: zone.color || '#000000',
                          strokeColor: zone.strokeColor || '',
                          strokeWidth: zone.strokeWidth || 0,
                          align: zone.align || 'center',
                          transform: zone.transform || 'none',
                          maxWidth: zone.maxWidth || 0,
                          multiline: zone.multiline || false,
                          lineHeight: zone.lineHeight || 1.2,
                          autoScale: zone.autoScale || false,
                          minFontSize: zone.minFontSize || 60,
                          letterSpacing: zone.letterSpacing || 0,
                          rotation: zone.rotation || 0
                        }
                      })
                      setZones(newZones)
                      alert('Config imported successfully!')
                    } else {
                      alert('Invalid format: expected an array of text zones')
                    }
                  } catch (err) {
                    console.error('Import error:', err)
                    alert('Failed to parse config: ' + err.message)
                  }
                }}
                className="mt-2 w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-semibold"
              >
                Import Config
              </button>
            </div>

            {/* Export Section */}
            <p className="text-xs text-gray-400 mb-2">Copy this to route.js when done:</p>
            <textarea
              readOnly
              value={generateConfig()}
              className="w-full h-64 bg-gray-900 text-green-400 font-mono text-xs p-2 rounded"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateConfig())
                alert('Copied to clipboard!')
              }}
              className="mt-2 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

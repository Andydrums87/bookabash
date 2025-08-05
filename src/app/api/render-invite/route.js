// app/api/render-invite/route.js

import puppeteer from 'puppeteer'
import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'
import { themes } from '@/lib/themes'

// Debug environment variables
console.log('🔧 Environment check:', {
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  apiKeyStart: process.env.CLOUDINARY_API_KEY?.substring(0, 5) + '...',
})

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dghzq6xtd',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { themeKey, inviteData, enhancedInviteData } = body

    if (!themeKey || !inviteData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!themes[themeKey]) {
      return NextResponse.json({ error: `Theme '${themeKey}' not found` }, { status: 400 })
    }

    console.log('🚀 Starting server-side invite rendering...')

    let browser = null

    try {
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ]
      })

      const page = await browser.newPage()
      
      // Set viewport to match invite dimensions
      await page.setViewport({
        width: 600,
        height: 800,
        deviceScaleFactor: 2 // Higher DPI for better quality
      })

      // Create the HTML content with your invite design
      const htmlContent = generateInviteHTML(themeKey, enhancedInviteData || inviteData)
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0', // Wait for all resources to load
        timeout: 30000
      })

      // Wait for fonts to load properly
      await page.evaluateHandle('document.fonts.ready')
      
      // Add extra wait for font rendering using setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('📸 Taking screenshot...')

      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: 600,
          height: 800
        },
        omitBackground: false
      })

      console.log('📤 Uploading to Cloudinary...')

      // Upload to Cloudinary
      const timestamp = Date.now()
      const filename = `${inviteData.childName?.replace(/\s+/g, '-') || 'template'}-${themeKey}-invite-${timestamp}`

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            public_id: filename,
            folder: 'party-invites',
            format: 'png'
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(screenshot)
      })

      console.log('✅ Upload successful:', uploadResult.secure_url)

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height
      })

    } finally {
      if (browser) {
        await browser.close()
      }
    }

  } catch (error) {
    console.error('❌ Server-side rendering failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Generate HTML content for the invite using actual theme layout
function generateInviteHTML(themeKey, inviteData) {
  const theme = themes[themeKey]
  const layout = theme.layoutConfig
  
  // Get the headline text using your existing logic
  const headlineText = inviteData.headlineText || getHeadlineText(inviteData, themeKey)
  
  // Generate CSS for each text element based on actual theme layout
  const generateTextElements = () => {
    return Object.entries(layout).map(([key, style]) => {
      let textContent = ''
      
      // Get text content for each layout element based on your theme structure
      switch (key) {
        case 'headline':
          textContent = headlineText
          // Handle birthday coloring
          if (inviteData.birthdayColor && textContent.includes('Birthday')) {
            textContent = textContent.replace('Birthday', `<span style="color: ${inviteData.birthdayColor}">Birthday</span>`)
          }
          break
        case 'childName':
          textContent = inviteData.childName || ''
          break
        case 'age':
          textContent = inviteData.age ? `${inviteData.age}` : ''
          break
        case 'dateTime':
          // Combined date and time
          const dateStr = inviteData.formattedDate || inviteData.date || ''
          const timeStr = inviteData.time || ''
          textContent = dateStr && timeStr ? `${dateStr} • ${timeStr}` : `${dateStr}${timeStr}`
          break
        case 'date':
          textContent = inviteData.formattedDate || inviteData.date || ''
          break
        case 'time':
          textContent = inviteData.time || ''
          break
        case 'location':
          textContent = inviteData.venue || ''
          break
        case 'message':
          textContent = inviteData.message || ''
          break
        case 'inviteText':
          textContent = `You're invited to ${inviteData.childName}'s Birthday Party!`
          break
        case 'ageDisplay':
          textContent = inviteData.age ? `Turning ${inviteData.age}!` : ''
          break
        default:
          textContent = ''
      }
      
      if (!textContent) return ''
      
      // Apply custom headline styles if available and this is a headline-type element
      const finalStyle = (key === 'headline' || key === 'childName') && inviteData.headlineStyles 
        ? { ...style, ...inviteData.headlineStyles }
        : style
      
      // Convert style object to CSS, preserving all original properties
      const cssStyles = {
        position: 'absolute',
        left: finalStyle.left || '50%',
        top: finalStyle.top || '50%',
        width: finalStyle.width || 'auto',
        transform: finalStyle.transform || 'translateX(-50%)',
        fontSize: finalStyle.fontSize || '16px',
        fontWeight: finalStyle.fontWeight || 'normal',
        fontFamily: finalStyle.fontFamily || 'Arial, sans-serif',
        color: finalStyle.color || '#000',
        textAlign: finalStyle.textAlign || 'center',
        lineHeight: finalStyle.lineHeight || '1.2',
        textShadow: finalStyle.textShadow || 'none',
        fontStyle: finalStyle.fontStyle || 'normal',
        zIndex: '10',
        whiteSpace: key === 'headline' ? 'pre-wrap' : 'nowrap',
        wordWrap: 'break-word',
        maxWidth: key === 'headline' ? '90%' : 'auto'
      }
      
      const cssString = Object.entries(cssStyles)
        .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ')
      
      return `<div style="${cssString}">${textContent}</div>`
    }).join('')
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&family=Fredoka:wght@400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&family=Bangers&family=Creepster&family=Shrikhand&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          width: 600px;
          height: 800px;
          overflow: hidden;
          font-family: 'Inter', 'Arial', sans-serif;
        }
        
        .invite-container {
          position: relative;
          width: 600px;
          height: 800px;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }
        
        /* Ensure fonts load properly */
        .text-element {
          font-display: swap;
        }
      </style>
    </head>
    <body>
      <div class="invite-container">
        <img src="${theme.backgroundUrl}" alt="${theme.name} Background" class="background-image" />
        ${generateTextElements()}
      </div>
    </body>
    </html>
  `
}

// Helper function for headline text
function getHeadlineText(inviteData, selectedTheme) {
  if (inviteData.headline === "custom") {
    return inviteData.customHeadline || `${inviteData.childName}'s ${inviteData.age}th Birthday`
  }

  // Add your headline logic here or import from your utils
  return inviteData.headlineText || `${inviteData.childName}'s ${inviteData.age}th Birthday`
}
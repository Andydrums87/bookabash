// API route for Templated.io invite generation
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const TEMPLATED_API_KEY = process.env.TEMPLATED_API_KEY

// Template IDs mapped to themes
const THEME_TEMPLATES = {
  dinosaur: '6be6e015-5f51-4226-a977-57746c42d1e8',
  // Add more themes here as you create templates:
  // unicorn: 'template-id-here',
  // superhero: 'template-id-here',
  // princess: 'template-id-here',
}

// Default template if theme doesn't have a specific one
const DEFAULT_TEMPLATE_ID = '6be6e015-5f51-4226-a977-57746c42d1e8'

/**
 * Format the title with proper possessive grammar
 * Each part on its own line to prevent awkward wrapping
 * e.g., "EMMA'S\nBIRTHDAY\nPARTY"
 */
function formatTitle(childName) {
  const upperName = childName.toUpperCase().trim()

  // If name ends in S, use just apostrophe
  if (upperName.endsWith('S')) {
    return `${upperName}'\nBIRTHDAY\nPARTY`
  }

  return `${upperName}'S\nBIRTHDAY\nPARTY`
}

/**
 * Get ordinal suffix for a day number (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

/**
 * Format the subtitle with date and time
 * e.g., "Saturday 3rd August\n2pm-4pm"
 */
function formatSubtitle(date, time) {
  let formattedDate = date

  try {
    // If date is in YYYY-MM-DD format, convert it
    if (date && date.includes('-') && date.split('-')[0].length === 4) {
      const dateObj = new Date(date)
      const day = dateObj.getDate()
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']

      const dayName = dayNames[dateObj.getDay()]
      const month = monthNames[dateObj.getMonth()]
      const ordinal = getOrdinalSuffix(day)

      formattedDate = `${dayName} ${day}${ordinal} ${month}`
    } else if (date) {
      // Already formatted like "Sunday 27th August" - just use as-is
      formattedDate = date
    }
  } catch (error) {
    console.warn('Date formatting error:', error)
    formattedDate = date || ''
  }

  // Format time - clean up spacing, keep original case style
  const formattedTime = time?.replace(/\s/g, '') || ''

  // Return date and time (template will wrap naturally)
  return `${formattedDate} ${formattedTime}`
}

export async function POST(request) {
  try {
    const {
      childName,
      date,
      time,
      venue,
      theme,
      templateId: customTemplateId // Allow override
    } = await request.json()

    console.log('🎨 Generating template invite for:', childName)
    console.log('📋 Theme:', theme)

    // Validate required fields
    if (!childName || !date || !time || !venue) {
      return Response.json({
        success: false,
        error: 'Missing required fields: childName, date, time, venue'
      }, { status: 400 })
    }

    // Get template ID for theme
    const templateId = customTemplateId || THEME_TEMPLATES[theme] || DEFAULT_TEMPLATE_ID
    console.log('📝 Using template:', templateId)

    // Prepare layer data
    const layers = {
      title: {
        text: formatTitle(childName)
      },
      subtitle: {
        text: formatSubtitle(date, time)
      },
      paragraph: {
        text: venue.toUpperCase()
      }
    }

    console.log('📊 Layer data:', layers)

    // Call Templated.io API
    const templatedResponse = await fetch('https://api.templated.io/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEMPLATED_API_KEY}`
      },
      body: JSON.stringify({
        template: templateId,
        layers: layers
      })
    })

    if (!templatedResponse.ok) {
      const errorText = await templatedResponse.text()
      console.error('❌ Templated.io error:', errorText)
      throw new Error(`Templated.io API error: ${templatedResponse.status} - ${errorText}`)
    }

    const templatedResult = await templatedResponse.json()
    console.log('✅ Templated.io response:', templatedResult)

    // Get the rendered image URL
    const renderedImageUrl = templatedResult.render_url || templatedResult.url || templatedResult.image_url

    if (!renderedImageUrl) {
      throw new Error('No image URL in Templated.io response')
    }

    // Upload to Cloudinary for reliable hosting
    const timestamp = Date.now()
    const filename = `${childName?.replace(/\s+/g, '-') || 'invite'}-${theme || 'party'}-${timestamp}`

    const uploadResult = await cloudinary.uploader.upload(renderedImageUrl, {
      public_id: filename,
      folder: 'template-invites',
      format: 'png',
      quality: 'auto:best'
    })

    console.log('✅ Uploaded to Cloudinary:', uploadResult.secure_url)

    return Response.json({
      success: true,
      imageUrl: uploadResult.secure_url,
      originalUrl: renderedImageUrl,
      templateId: templateId,
      metadata: {
        childName,
        date,
        time,
        venue,
        theme,
        generatedAt: new Date().toISOString(),
        source: 'templated.io'
      }
    })

  } catch (error) {
    console.error('❌ Template invite generation error:', error)

    return Response.json({
      success: false,
      error: error.message || 'Failed to generate invite'
    }, { status: 500 })
  }
}

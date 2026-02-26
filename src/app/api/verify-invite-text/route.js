// API route for OCR text verification of AI-generated invites
// Uses Google Cloud Vision API to extract text and verify accuracy

export async function POST(request) {
  try {
    const { imageUrl, expectedData } = await request.json()

    // expectedData should contain: childName, date, time, venue
    if (!imageUrl || !expectedData) {
      return Response.json({
        success: false,
        error: 'Missing imageUrl or expectedData'
      }, { status: 400 })
    }

    console.log('🔍 Verifying invite text for:', expectedData.childName)

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    // Call Google Cloud Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1
                }
              ]
            }
          ]
        })
      }
    )

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text()
      console.error('Vision API error:', errorText)
      throw new Error('Vision API request failed')
    }

    const visionResult = await visionResponse.json()

    // Extract detected text
    const detectedText = visionResult.responses?.[0]?.fullTextAnnotation?.text || ''
    const detectedTextLower = detectedText.toLowerCase()

    console.log('📝 Detected text:', detectedText.substring(0, 200) + '...')

    // Verify each expected field
    const verification = {
      childName: false,
      date: false,
      time: false,
      venue: false
    }

    // Check child's name (first name only, case-insensitive)
    const firstName = expectedData.childName?.split(' ')[0]?.toLowerCase()
    if (firstName && detectedTextLower.includes(firstName)) {
      verification.childName = true
    }

    // Check date - look for key parts
    // Date might be formatted like "Friday 13th March" or "13 March" etc
    const dateStr = expectedData.date?.toLowerCase() || ''
    // Extract day number and month
    const dayMatch = dateStr.match(/(\d+)/)
    const monthMatch = dateStr.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i)

    if (dayMatch && detectedTextLower.includes(dayMatch[1])) {
      if (monthMatch && detectedTextLower.includes(monthMatch[1].toLowerCase())) {
        verification.date = true
      }
    }

    // Check time - look for the time pattern
    const timeStr = expectedData.time?.toLowerCase().replace(/\s/g, '') || ''
    // Extract start time at minimum (e.g., "2pm" from "2pm-4pm")
    const timeMatch = timeStr.match(/(\d+)(am|pm)/)
    if (timeMatch) {
      const timePattern = timeMatch[1] + timeMatch[2]
      if (detectedTextLower.replace(/\s/g, '').includes(timePattern)) {
        verification.time = true
      }
    }

    // Check venue - look for key parts of the address
    const venueStr = expectedData.venue?.toLowerCase() || ''
    // Split venue into words and check if at least half are present
    const venueWords = venueStr.split(/[\s,]+/).filter(w => w.length > 3)
    const matchedWords = venueWords.filter(word => detectedTextLower.includes(word))
    if (matchedWords.length >= Math.ceil(venueWords.length / 2)) {
      verification.venue = true
    }

    // Calculate overall score
    const checks = Object.values(verification)
    const passedChecks = checks.filter(v => v).length
    const totalChecks = checks.length
    const score = passedChecks / totalChecks

    // Determine if invite passes verification
    // Require at least 3 out of 4 checks to pass (75%)
    const isValid = passedChecks >= 3

    console.log('✅ Verification result:', {
      verification,
      score: `${passedChecks}/${totalChecks}`,
      isValid
    })

    return Response.json({
      success: true,
      isValid,
      score,
      passedChecks,
      totalChecks,
      verification,
      detectedText: detectedText.substring(0, 500), // Return first 500 chars for debugging
      debug: {
        expectedName: firstName,
        expectedDate: dateStr,
        expectedTime: timeStr,
        venueWordsChecked: venueWords.length,
        venueWordsMatched: matchedWords.length
      }
    })

  } catch (error) {
    console.error('❌ Text verification error:', error)

    return Response.json({
      success: false,
      error: error.message || 'Failed to verify text'
    }, { status: 500 })
  }
}

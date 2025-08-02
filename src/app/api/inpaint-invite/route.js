// /api/inpaint-invite/route.js - Using Ideogram 3.0 Remix
export async function POST(request) {
  try {
    const { image_url, childName, date, time, venue, theme } = await request.json();

    console.log('🎨 Using Ideogram 3.0 remix for:', childName);

    // Validate inputs
    if (!image_url || !childName || !date || !time || !venue) {
      return Response.json({
        success: false,
        error: 'Missing required fields: image_url, childName, date, time, venue'
      }, { status: 400 });
    }

    // Check API key
    if (!process.env.IDEOGRAM_API_KEY) {
      console.error('❌ IDEOGRAM_API_KEY not found');
      return Response.json({
        success: false,
        error: 'API key not configured'
      }, { status: 500 });
    }

    // Download the source image
    console.log('📥 Downloading source image from:', image_url);
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      console.error('❌ Failed to fetch image:', imageResponse.status);
      throw new Error(`Failed to fetch source image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('✅ Image downloaded, size:', imageBuffer.byteLength, 'bytes');

    // Create the remix prompt - emphasize text addition
    const remixPrompt = `Create a birthday party invitation using this image as inspiration. IMPORTANT: Add clear, bold, readable text overlay:

"Join us for ${childName}'s Birthday Party!"

Date: ${date}
Time: ${time}
Location: ${venue}

The text must be PROMINENT, BOLD, and EASILY READABLE. Use contrasting colors and large fonts. Place text in the center or bottom area where it's most visible. The text is the most important element - make it stand out clearly against the background.`;

    // Prepare multipart form data for Ideogram 3.0
    const formData = new FormData();
    formData.append('prompt', remixPrompt);
    formData.append('image_weight', '30'); // Lower weight so text is more prominent
    formData.append('seed', Math.floor(Math.random() * 2147483647).toString());
    formData.append('aspect_ratio', '3x4'); // Portrait orientation
    formData.append('rendering_speed', 'DEFAULT'); // Options: TURBO, DEFAULT, QUALITY
    formData.append('magic_prompt_option', 'OFF'); // Don't modify our prompt
    
    // Add the image file
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image', imageBlob, 'source.jpg');

    console.log('📤 Sending remix request to Ideogram 3.0...');

    // Call Ideogram 3.0 remix endpoint - CORRECT ENDPOINT
    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/remix', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY,
        // Don't set Content-Type - let fetch handle multipart/form-data
      },
      body: formData
    });

    console.log('📨 Ideogram response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ideogram 3.0 API Error:', response.status);
      console.error('❌ Error details:', errorText);
      
      let errorMessage = `Ideogram 3.0 API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.detail || errorMessage;
        console.error('📋 Parsed error:', errorData);
      } catch (e) {
        console.error('📋 Raw error:', errorText);
      }
      
      return Response.json({
        success: false,
        error: errorMessage,
        statusCode: response.status,
        details: errorText.substring(0, 200) // Truncate for response
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('🚀 Ideogram 3.0 response received successfully');

    if (result.data && result.data.length > 0) {
      const remixedImageUrl = result.data[0].url;
      
      console.log('✅ Ideogram 3.0 remix completed successfully');
      console.log('🖼️ Result image URL:', remixedImageUrl);
      
      return Response.json({
        success: true,
        imageUrl: remixedImageUrl,
        originalImageUrl: image_url,
        method: 'ideogram-v3-remix',
        metadata: {
          childName,
          date,
          time,
          venue,
          theme,
          remixedAt: new Date().toISOString(),
          model: 'ideogram-3.0',
          prompt: remixPrompt,
          seed: result.data[0].seed || 'unknown',
          resolution: result.data[0].resolution || 'unknown'
        }
      });
    } else {
      console.error('❌ No remixed image in response');
      console.error('📋 Full response:', JSON.stringify(result, null, 2));
      
      return Response.json({
        success: false,
        error: 'No remixed image generated - empty response from Ideogram 3.0'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Ideogram 3.0 remix error:', error.message);
    console.error('📋 Error stack:', error.stack);
    
    return Response.json({
      success: false,
      error: error.message || 'Failed to remix invite with Ideogram 3.0',
      type: error.name || 'UnknownError'
    }, { status: 500 });
  }
}

export async function POST_BALANCED_APPROACH(request) {
  try {
    const { image_url, childName, date, time, venue, theme } = await request.json();

    console.log('🎨 Finding perfect balance for text overlay:', childName);

    const imageResponse = await fetch(image_url);
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Try different image weights in order (preserve background but add text)
    const weightOptions = [
      {
        weight: '80',
        prompt: `Preserve this EXACT background and design. Only add party text overlay in a clear, readable area:

"Join us for ${childName}'s Birthday Party!"
${date} • ${time} • ${venue}

Keep all existing colors, decorations, and style. Just overlay the text with good contrast and readability.`,
        description: 'High preservation with text overlay'
      },
      {
        weight: '90', 
        prompt: `Keep this background design exactly as is. Add prominent, readable party details:

"Join us for ${childName}'s Birthday  Party!"

Date: ${date}
Time: ${time}
Venue: ${venue}

Maintain the original style but ensure text is clearly visible with proper contrast.`,
        description: 'Medium-high preservation'
      },
      {
        weight: '95',
        prompt: `Use this background but make the party text very clear and readable:

"Join us for ${childName}'s Birthday Party!"

📅 ${date}
🕐 ${time}  
📍 ${venue}

Balance keeping the original design with making sure the text stands out clearly.`,
        description: 'Balanced approach'
      }
    ];

    for (const option of weightOptions) {
      try {
        console.log(`🔄 Trying weight ${option.weight}: ${option.description}`);
        
        const formData = new FormData();
        formData.append('prompt', option.prompt);
        formData.append('image_weight', option.weight);
        formData.append('aspect_ratio', '3x4');
        formData.append('rendering_speed', 'DEFAULT');
        formData.append('magic_prompt_option', 'OFF');
        formData.append('seed', Math.floor(Math.random() * 2147483647).toString());
        
        const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
        formData.append('image', imageBlob, 'source.jpg');

        const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/remix', {
          method: 'POST',
          headers: {
            'Api-Key': process.env.IDEOGRAM_API_KEY,
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            console.log(`✅ Success with weight ${option.weight}`);
            return Response.json({
              success: true,
              imageUrl: result.data[0].url,
              originalImageUrl: image_url,
              imageWeight: option.weight,
              approach: option.description,
              metadata: {
                childName, date, time, venue, theme,
                remixedAt: new Date().toISOString(),
                model: 'ideogram-3.0-balanced'
              }
            });
          }
        }
        
        console.log(`❌ Weight ${option.weight} failed, trying next...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        
      } catch (error) {
        console.log(`❌ Error with weight ${option.weight}:`, error.message);
        continue;
      }
    }

    throw new Error('All balanced approaches failed');

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message || 'Failed to create balanced text overlay'
    }, { status: 500 });
  }
}

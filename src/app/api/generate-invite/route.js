import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { prompt, childName, date, time, venue, theme, themeName, referenceImageUrl } = await request.json();

    console.log('🎨 Generating Ideogram v3 invite for:', childName);
    console.log('🎯 Theme:', themeName);
    console.log('📸 Reference image:', referenceImageUrl ? 'Provided' : 'None');

    // Prepare input for Replicate
    const input = {
      prompt: prompt,
      aspect_ratio: "3:4",
      magic_prompt: "Off",
      seed: Math.floor(Math.random() * 1000000),
    };

    // Add reference images OR style_type, but not both
    if (referenceImageUrl) {
      const referenceImages = Array.isArray(referenceImageUrl) 
        ? referenceImageUrl 
        : [referenceImageUrl];
      
      input.style_reference_images = referenceImages;
      console.log('✅ Using style_reference_images, skipping style_type');
    } else {
      input.style_type = "Design";
      console.log('✅ Using style_type: Design');
    }

    const output = await replicate.run("ideogram-ai/ideogram-v3-turbo", { input });

    // Extract URL - handle Replicate's special url() function that returns URL object
    let imageUrl = null;

    if (typeof output === 'string') {
      // Direct string URL
      imageUrl = output;
      console.log('✅ Found direct string URL');
    } else if (Array.isArray(output) && output.length > 0) {
      // Array of URLs or objects with url() function
      const firstItem = output[0];
      if (typeof firstItem === 'string') {
        imageUrl = firstItem;
        console.log('✅ Found string URL in array');
      } else if (firstItem && typeof firstItem.url === 'function') {
        const urlResult = firstItem.url();
        imageUrl = urlResult.href || urlResult.toString();
        console.log('✅ Found URL by calling firstItem.url() and converting to string');
      }
    } else if (output && typeof output === 'object') {
      // Object with url() function
      if (typeof output.url === 'function') {
        const urlResult = output.url();
        // Convert URL object to string
        imageUrl = urlResult.href || urlResult.toString();
        console.log('✅ Found URL by calling output.url() and converting to string');
      } else if (typeof output.url === 'string') {
        imageUrl = output.url;
        console.log('✅ Found URL string in output.url');
      }
    }

    console.log('🎯 FINAL EXTRACTED IMAGE URL:', imageUrl);
    console.log('🎯 IMAGE URL TYPE:', typeof imageUrl);

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      console.error('❌ Invalid image URL extracted:', imageUrl);
      throw new Error(`Could not extract valid image URL. Got: ${typeof imageUrl === 'object' ? JSON.stringify(imageUrl) : imageUrl}`);
    }

    console.log('✅ Ideogram v3 image generated successfully');
    
    return Response.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      metadata: {
        childName,
        date,
        time,
        venue,
        theme,
        themeName,
        referenceUsed: !!referenceImageUrl,
        generatedAt: new Date().toISOString(),
        model: 'ideogram-v3-turbo'
      }
    });

  } catch (error) {
    console.error('❌ Ideogram v3 generation error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Failed to generate invite'
    }, { status: 500 });
  }
}
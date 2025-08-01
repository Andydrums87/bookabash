export async function POST(request) {
    try {
      const { prompt, childName, date, time, venue, theme, themeName } = await request.json();
  
      console.log('🎨 Generating Ideogram invite for:', childName);
      console.log('🎯 Theme:', themeName);
  
      const response = await fetch('https://api.ideogram.ai/generate', {
        method: 'POST',
        headers: {
          'Api-Key': process.env.IDEOGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_request: {
            model: "V_2", // Latest model, best for text
            prompt: prompt,
            aspect_ratio: "ASPECT_3_4", // Portrait for invites
            magic_prompt_option: "OFF", // Don't modify our prompt
            seed: Math.floor(Math.random() * 1000000),
            style_type: "DESIGN"
          }
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ideogram API Error:', errorText);
        throw new Error(`Ideogram API error: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      console.log('🚀 Ideogram response:', result);
  
      if (result.data && result.data.length > 0) {
        const imageUrl = result.data[0].url;
        
        console.log('✅ Ideogram image generated successfully');
        
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
            generatedAt: new Date().toISOString(),
            model: 'ideogram-v2'
          }
        });
      } else {
        throw new Error('No image generated');
      }
  
    } catch (error) {
      console.error('❌ Ideogram generation error:', error);
      
      return Response.json({
        success: false,
        error: error.message || 'Failed to generate invite'
      }, { status: 500 });
    }
  }
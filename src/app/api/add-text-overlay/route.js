import { createCanvas, loadImage } from 'canvas';

export async function POST(request) {
  try {
    const { imageUrl, partyDetails, theme } = await request.json();

    console.log('🎨 Adding professional text box to image');

    // Load the base image
    const baseImage = await loadImage(imageUrl);
    
    // Create canvas matching image dimensions
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the base AI image
    ctx.drawImage(baseImage, 0, 0);
    
    // Create professional text box at bottom
    const boxHeight = canvas.height * 0.25; // 25% of image height
    const boxY = canvas.height - boxHeight;
    const margin = canvas.width * 0.05; // 5% margin on sides
    const boxWidth = canvas.width - (margin * 2);
    const boxX = margin;
    
    // Draw rounded rectangle background
    const cornerRadius = 15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'; // Semi-transparent white
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Text styling - consistent and professional
    const fontSize = Math.max(canvas.width * 0.028, 16);
    ctx.fillStyle = '#2d3748'; // Dark gray text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    
    // Text positions within the box
    const centerX = canvas.width / 2;
    const textAreaY = boxY + boxHeight * 0.3;
    const lineSpacing = fontSize * 1.4;
    
    // Draw party details with consistent formatting
    ctx.fillText(`📅 ${partyDetails.date}`, centerX, textAreaY);
    ctx.fillText(`🕐 ${partyDetails.time}`, centerX, textAreaY + lineSpacing);
    ctx.fillText(`📍 ${partyDetails.venue}`, centerX, textAreaY + lineSpacing * 2);
    
    // Convert to base64
    const finalImageBuffer = canvas.toBuffer('image/png');
    const finalImageBase64 = `data:image/png;base64,${finalImageBuffer.toString('base64')}`;
    
    console.log('✅ Professional text box added successfully');
    
    return Response.json({
      success: true,
      imageUrl: finalImageBase64,
      metadata: {
        originalImageUrl: imageUrl,
        partyDetails,
        theme,
        overlayType: 'professional-text-box',
        overlayAddedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Text overlay error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Failed to add text overlay'
    }, { status: 500 });
  }
}
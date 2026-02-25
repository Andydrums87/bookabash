// 2. Enhanced Invite Generation with Sharing: /app/api/generate-invite-ai/route.js
import Replicate from "replicate";
import { v2 as cloudinary } from 'cloudinary'
import { urlGenerator } from '@/utils/urlGenerator'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Configure Cloudinary for backup storage
cloudinary.config({

  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { 
      prompt, 
      childName, 
      date, 
      time, 
      venue, 
      theme, 
      themeName, 
      referenceImageUrl,
      // NEW: Additional data for sharing
      partyId,
      registryId,
      generateSharingUrls = true
    } = await request.json();

    console.log('🎨 Generating AI invite for:', childName);
    console.log('🎯 Theme:', themeName);

    // Prepare input for flawless-text model
    // This model expects 'data' to be a JSON string with prompt field
    const input = {
      data: JSON.stringify({
        prompt: prompt
      }),
    };

    const output = await replicate.run(
      "subhash25rawat/flawless-text:3142f4263ca49db113f8702a00114c2a6a6f450d67cb089a0106fd26ddc73bcc",
      { input }
    );

    // Extract image URL (your existing logic)
    let imageUrl = null;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      const firstItem = output[0];
      if (typeof firstItem === 'string') {
        imageUrl = firstItem;
      } else if (firstItem && typeof firstItem.url === 'function') {
        const urlResult = firstItem.url();
        imageUrl = urlResult.href || urlResult.toString();
      }
    } else if (output && typeof output === 'object') {
      if (typeof output.url === 'function') {
        const urlResult = output.url();
        imageUrl = urlResult.href || urlResult.toString();
      } else if (typeof output.url === 'string') {
        imageUrl = output.url;
      }
    }

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error(`Could not extract valid image URL. Got: ${typeof imageUrl === 'object' ? JSON.stringify(imageUrl) : imageUrl}`);
    }

    // NEW: Generate sharing-friendly URLs and backup to Cloudinary
    let sharing = {};
    
    if (generateSharingUrls) {
      try {
        console.log('📤 Creating sharing assets...');
        
        // Upload to Cloudinary for reliable hosting
        const timestamp = Date.now();
        const filename = `${childName?.replace(/\s+/g, '-') || 'invite'}-${themeName?.replace(/\s+/g, '-') || 'party'}-${timestamp}`;
        
        const uploadResult = await cloudinary.uploader.upload(imageUrl, {
          public_id: filename,
          folder: 'ai-invites',
          format: 'jpg',
          quality: 'auto',
          fetch_format: 'auto'
        });

        // Generate friendly URLs
        const partyData = { childName, themeName };
        const inviteSlug = urlGenerator.createInviteSlug(partyData, partyId || `invite_${timestamp}`);
        const registrySlug = registryId ? urlGenerator.createRegistrySlug(partyData, registryId) : null;

        sharing = {
          inviteUrl: urlGenerator.createAbsoluteUrl(`/invite/${inviteSlug}`),
          registryUrl: registrySlug ? urlGenerator.createAbsoluteUrl(`/gifts/${registrySlug}`) : null,
          imageUrl: uploadResult.secure_url, // Cloudinary URL for reliable sharing
          slug: inviteSlug,
          whatsappText: `🎉 You're invited to ${childName}'s ${themeName} Party!\n\n📅 ${date} at ${time}\n📍 ${venue}\n\nRSVP:`,
          socialTitle: `🎉 ${childName}'s ${themeName} Party Invitation`,
          socialDescription: `Join us for ${childName}'s special ${themeName} birthday celebration on ${date}!`
        };

        console.log('✅ Sharing assets created');
      } catch (uploadError) {
        console.warn('⚠️ Could not create sharing assets:', uploadError.message);
        // Continue without sharing features
      }
    }

    console.log('✅ AI invite generated successfully');
    
    return Response.json({
      success: true,
      imageUrl: imageUrl,
      backupImageUrl: sharing.imageUrl, // Cloudinary backup
      prompt: prompt,
      sharing, // NEW: Sharing URLs and data
      metadata: {
        childName,
        date,
        time,
        venue,
        theme,
        themeName,
        referenceUsed: !!referenceImageUrl,
        generatedAt: new Date().toISOString(),
        model: 'flawless-text'
      }
    });

  } catch (error) {
    console.error('❌ AI invite generation error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Failed to generate invite'
    }, { status: 500 });
  }
}
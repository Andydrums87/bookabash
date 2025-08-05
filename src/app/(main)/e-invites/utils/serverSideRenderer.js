// utils/serverSideRenderer.js

/**
 * Server-side template rendering using Puppeteer API
 */
export const renderTemplateAndUpload = async (themeKey, inviteData) => {
    try {
      console.log("🎨 Starting server-side template rendering:", themeKey)
  
      const response = await fetch('/api/render-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          themeKey,
          inviteData,
          enhancedInviteData: inviteData // Pass the enhanced data if available
        })
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }
  
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Server-side rendering failed')
      }
  
      console.log("✅ Server-side rendering successful:", result.url)
  
      return {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height
      }
  
    } catch (error) {
      console.error("❌ Server-side rendering failed:", error)
      throw error
    }
  }
  
  /**
   * Updated uploadFinalInvite function to use server-side rendering for templates
   */
  export const uploadFinalInvite = async (selectedAiOption, selectedTheme, inviteData) => {
    const filename = `${inviteData.childName?.replace(/\s+/g, '-') || 'invite'}-${Date.now()}`
  
    if (selectedAiOption?.imageUrl) {
      // Upload AI generated image (existing logic)
      console.log("🤖 Processing AI invite for final upload")
      return await uploadImageUrlToCloudinary(selectedAiOption.imageUrl, `${filename}-ai`)
    } else if (selectedTheme) {
      // Use server-side rendering for templates
      console.log("🎨 Processing template invite with server-side rendering")
      return await renderTemplateAndUpload(selectedTheme, inviteData)
    } else {
      throw new Error('No invite selected for upload')
    }
  }
  
  /**
   * Keep the existing AI image upload function unchanged
   */
  export const uploadImageUrlToCloudinary = async (imageUrl, filename = 'invite') => {
    try {
      console.log("📤 Uploading image URL to Cloudinary:", imageUrl)
  
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
      }
  
      const imageBlob = await imageResponse.blob()
      console.log("📤 Image blob created, size:", imageBlob.size)
  
      const formData = new FormData()
      formData.append("file", imageBlob, `${filename}.png`)
      formData.append("upload_preset", "portfolio_images")
      formData.append("folder", "party-invites")
  
      console.log("📤 Uploading to Cloudinary...")
  
      const response = await fetch("https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload", {
        method: "POST",
        body: formData,
      })
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Cloudinary response:", response.status, errorText)
        throw new Error(`Cloudinary upload failed: ${response.statusText}`)
      }
  
      const cloudinaryData = await response.json()
      console.log("✅ Cloudinary upload successful:", cloudinaryData.secure_url)
  
      return {
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        width: cloudinaryData.width,
        height: cloudinaryData.height
      }
  
    } catch (error) {
      console.error("❌ Upload failed:", error)
      throw error
    }
  }
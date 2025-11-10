import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dghzq6xtd',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'gift_registry_headers'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 400, crop: 'fit' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      uploadStream.end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}

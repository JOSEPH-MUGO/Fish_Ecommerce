// File: server/config/cloudinary.js
const cloudinary = require("cloudinary").v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary
const uploadImage = async (file, folder = "fish-ecommerce") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: "auto",
      transformation: [{ width: 800, height: 600,
        crop: "limit" }, { quality: "auto" }, { format: "auto" }],
      eager: [{ width: 400, crop: "scale" }],
      eager_async: true,
      timeout: 60000
    })

    return {
      url: result.secure_url,
      public_id: result.public_id
      
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (error.message.includes("rate limit")) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return uploadImage(file, folder);
    }
    throw new Error("Image upload failed")
  }
}

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw new Error("Image deletion failed")
  }
}

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
}

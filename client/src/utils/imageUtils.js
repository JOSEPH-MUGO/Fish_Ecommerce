// File: client/src/utils/imageUtils.js
export const getProductImage = (images) => {
  if (!images) return "/placeholder.png";
  
  // Handle string URL
  if (typeof images === "string") return images;
  
  // Handle Cloudinary object
  if (images.url) return images.url;
  
  // Handle array of images
  if (Array.isArray(images)) {
    return images[0]?.url || images[0] || "/placeholder.png";
  }
  
  return "/placeholder.png";
};
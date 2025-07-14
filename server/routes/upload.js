// File: server/routes/upload.js
const express = require("express")
const multer = require("multer")
const path = require("path")
const { uploadImage, deleteImage } = require("../config/cloudinary")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, GIF) are allowed"))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
})

// Upload single image
router.post("/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    const result = await uploadImage(req.file, "fish-ecommerce/products")

    // Clean up local file
    const fs = require("fs")
    fs.unlinkSync(req.file.path)

    res.json({
      message: "Image uploaded successfully",
      image: result,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Error uploading image" })
  }
})

// Delete image
router.delete("/image/:publicId", auth, async (req, res) => {
  try {
    const { publicId } = req.params

    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId)

    const result = await deleteImage(decodedPublicId)

    res.json({
      message: "Image deleted successfully",
      result,
    })
  } catch (error) {
    console.error("Delete image error:", error)
    res.status(500).json({ message: "Error deleting image" })
  }
})

module.exports = router

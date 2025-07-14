// File: client/src/components/ImageUpload.js
"use client";

import { useState, useRef, useEffect } from "react";
import { FiX, FiImage } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

const ImageUpload = ({
  onImageUpload,
  existingImage = null,
  className = "",
 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState(
    existingImage
      ? typeof existingImage === "string"
        ? { url: existingImage }
        : existingImage
      : null
  );
  useEffect(() => {
  setImage(
    existingImage
      ? typeof existingImage === "string"
        ? { url: existingImage }
        : existingImage
      : null
  );
}, [existingImage]);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);

      // Upload to single image endpoint
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newImage = response.data.image;
      setImage(newImage);
      onImageUpload(newImage); // Pass {url, publicId} to parent
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = async () => {
    if (!image) return;

    try {
      const token = localStorage.getItem("token");

      // Delete from Cloudinary if public_id exists
      if (image.publicId) {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/upload/image/${encodeURIComponent(
            image.publicId
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setImage(null);
      onImageUpload(null);
      toast.success("Image removed successfully!");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        <div className="space-y-2">
          <FiImage className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Click to upload
            </span>{" "}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
        </div>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {image && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Preview</h4>
          <div className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={image.url}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

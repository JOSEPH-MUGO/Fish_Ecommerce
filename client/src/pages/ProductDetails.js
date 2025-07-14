// client/src/pages/ProductDetails.js
"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import { fetchWithRetry } from "../utils/api";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addToCart } = useCart();
  const [productsCache, setProductsCache] = useState({});

  useEffect(() => {
    const loadProduct = async () => {
      if (productsCache[id]) {
        setProduct(productsCache[id]);
        return;
      }
      try {
        setLoading(true);
        const response = await fetchWithRetry(
          `${process.env.REACT_APP_API_URL}/products/${id}`
        );
        setProduct(response.data);
        setProductsCache((prev) => ({ ...prev, [id]: response.data }));

        // Load related products
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, productsCache]);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const formatCurrency = (amount) => `KES ${amount.toFixed(2)}`;

  const getProductImages = () => {
    if (!product.images) return [];

    // Handle Cloudinary object
    if (product.images.url) return [product.images.url];

    // Handle string URL
    if (typeof product.images === "string") return [product.images];

    // Handle array of images
    if (Array.isArray(product.images)) {
      return product.images.map((img) => img.url || img);
    }

    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <Link to="/shop" className="text-blue-600 hover:underline">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const productImages = getProductImages();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:underline">
              Home
            </Link>
            <span className="text-gray-500">/</span>
            <Link to="/shop" className="text-blue-600 hover:underline">
              Shop
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-800">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-md">
              {product.featured && (
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <FaStar className="mr-1" />
                  Featured
                </div>
              )}
              {product.isWeekendOffer && (
                <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Weekend Offer
                </div>
              )}

              {product.isSustainable && (
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Sustainable
                </div>
              )}

              <img
                src={productImages[selectedImageIndex] || "/placeholder.png"}
                loading="lazy"
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))
                    }
                    disabled={selectedImageIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md disabled:opacity-50"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        Math.min(
                          productImages.length - 1,
                          selectedImageIndex + 1
                        )
                      )
                    }
                    disabled={selectedImageIndex === productImages.length - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md disabled:opacity-50"
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? "border-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.png?height=100&width=100"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center"></div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.category.name}
                </span>
              </div>
            </div>

            <div className="border-t border-b py-6">
              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-4xl font-bold text-blue-600">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-gray-500">each</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock Level:</span>
                  <span
                    className={`font-medium ${
                      product.stock > 10
                        ? "text-green-600"
                        : product.stock > 0
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Out of stock"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      product.stock > 10
                        ? "bg-green-500"
                        : product.stock > 0
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min((product.stock / 20) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-l border-r border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <FaShoppingCart />
                  <span>
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </span>
                </button>

                <button
                  onClick={toggleWishlist}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isWishlisted ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-400" />
                  )}
                </button>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ Fresh daily delivery</p>
                <p>✓ Sustainably sourced</p>
                <p>✓ Quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

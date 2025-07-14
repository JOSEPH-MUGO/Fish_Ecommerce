// File: client/src/components/ProductCard.js
"use client";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaEye, FaStar, FaFish } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="card group hover:shadow-ocean transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative overflow-hidden">
        {/* Product Image */}
        <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-ocean-50 to-teal-50">
          {product.images ? (
            <img
              src={product.images || "/placeholder.png"}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-ocean-100 to-teal-100">
              <FaFish className="text-4xl text-ocean-300" />
            </div>
          )}
        </div>

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-3">
            <Link
              to={`/product/${product.id}`}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-ocean-600 hover:bg-ocean-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              <FaEye size={16} />
            </Link>
            <button
              onClick={handleAddToCart}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-ocean-600 hover:bg-ocean-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              <FaShoppingCart size={16} />
            </button>
          </div>
        </div>

        {/* Stock badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3">
            <span className="badge badge-warning animate-pulse">
              Only {product.stock} left!
            </span>
          </div>
        )}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">
            <FaStar className="inline mr-1" />
            Featured
          </div>
        )}

        {/* Out of stock badge */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3">
            <span className="badge badge-danger">Out of Stock</span>
          </div>
        )}

        {/* Fresh badge */}
        {product.isFresh && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-emerald-500 text-white">Fresh Today</span>
          </div>
        )}
      </div>

      <div className="card-body">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-ocean-600 bg-ocean-50 px-2 py-1 rounded-full">
            {product.category.name}
          </span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 group-hover:text-ocean-600 transition-colors duration-300 mb-2 line-clamp-2 font-poppins">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price and Weight */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-bold text-ocean-600 font-poppins">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              per {product.unit || "kg"}
            </span>
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {/*special offers*/}
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

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 btn-outline text-center text-sm py-2"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 text-sm py-2 ${
              product.stock === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "btn-primary"
            }`}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span>Fresh</span>
            </span>
            <span>Stock: {product.stock}</span>
            <span>{product.origin || "Local Waters"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

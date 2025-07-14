//client/src/pages/Shop.js
"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaFilter,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useCallback } from "react";

const Shop = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  const { addToCart } = useCart();
  const [activeFilters, setActiveFilters] = useState({
    weekend: false,
    sustainable: false,
  });

  const heroImages = [
    "https://res.cloudinary.com/djdalpfdh/image/upload/v1751704196/fish-ecommerce/products/j8hik1rtaficumtc4omf.jpg",
    "https://res.cloudinary.com/djdalpfdh/image/upload/v1752148641/fish-ecommerce/products/fegan1llygvlv7lyuhae.jpg",
    "https://res.cloudinary.com/djdalpfdh/image/upload/v1752399346/fish-ecommerce/products/l9pbsevlqi4h4chcqqv5.jpg",
    "https://res.cloudinary.com/djdalpfdh/image/upload/v1752399452/fish-ecommerce/products/visfoab0gtre5tfgxklv.jpg",
  ];
  // ...rest of imports

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(location.search);

      // Get filter values from URL
      const isWeekend = params.get("weekend") === "true";
      const isSustainable = params.get("sustainable") === "true";

      setActiveFilters({
        weekend: isWeekend,
        sustainable: isSustainable,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/products`,
        {
          params: {
            weekendOffer: isWeekend,
            sustainable: isSustainable,
          },
        }
      );
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    loadProducts();
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [heroImages.length, loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const goToSlide = (index) => {
    clearInterval(intervalRef.current);
    setCurrentSlide(index);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
  };

  const categories = [
    "all",
    ...new Set(products.map((product) => product.category?.name)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const toggleWishlist = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const formatCurrency = (amount) => `KES ${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Background Slides */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
        </div>

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30" />

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center max-w-3xl z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Fresh Fish
            </h1>
            <p className="text-xl mb-8 text-white">
              Fresh Fish & Seafood Delivered Daily
            </p>
            <div className="max-w-2xl mx-auto relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for fresh fish, seafood..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-5"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {(activeFilters.weekend || activeFilters.sustainable) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeFilters.weekend && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                Weekend Offers
                <button
                  onClick={() => (window.location.href = "/shop")}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  &times;
                </button>
              </span>
            )}
            {activeFilters.sustainable && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                Sustainable Products
                <button
                  onClick={() => (window.location.href = "/shop")}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  &times;
                </button>
              </span>
            )}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}

          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-blue-600"
                >
                  <FaFilter />
                </button>
              </div>

              <div
                className={`space-y-6 ${
                  showFilters ? "block" : "hidden lg:block"
                }`}
              >
                {/* Category Filter */}
                <div>
                  <h4 className="font-medium mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="mr-2"
                        />
                        <span className="capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([0, Number.parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>KES 0</span>
                      <span>KES {priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h4 className="font-medium mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Main Products Grid */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory === "all" ? "All Products" : selectedCategory}
                <span className="text-gray-500 text-base ml-2">
                  ({sortedProducts.length} products)
                </span>
              </h2>
            </div>

            {currentProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative">
                        <img
                          src={
                            typeof product.images === "string"
                              ? product.images
                              : product.images?.url || "/placeholder.png"
                          }
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                        >
                          {wishlist.includes(product.id) ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart className="text-gray-400" />
                          )}
                        </button>
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
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-blue-600">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-gray-500 text-sm ml-1"></span>
                          </div>

                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={product.stock === 0}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-full transition-colors"
                          >
                            <FaShoppingCart />
                          </button>
                        </div>

                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Stock: {product.stock}</span>
                            <span
                              className={
                                product.stock > 10
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }
                            >
                              {product.stock > 10 ? "In Stock" : "Low Stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(currentPage - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === index + 1
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(currentPage + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

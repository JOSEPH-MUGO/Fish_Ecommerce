//client/src/pages/Home.js
"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaStar } from "react-icons/fa";
import axios from "axios";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  const heroImages = [
    "https://res.cloudinary.com/djdalpfdh/image/upload/v1751704196/fish-ecommerce/products/j8hik1rtaficumtc4omf.jpg",
    "https://res.cloudinary.com/djdalpfdh/image/upload/v1752148641/fish-ecommerce/products/fegan1llygvlv7lyuhae.jpg",
    "https://res.cloudinary.com/djdalpfdh/image/upload/v1752399346/fish-ecommerce/products/l9pbsevlqi4h4chcqqv5.jpg",
    "https://res.cloudinary.com/djdalpfdh/image/upload/v1752399452/fish-ecommerce/products/visfoab0gtre5tfgxklv.jpg",
  ];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/products?featured=true&limit=4`
        );

        setFeaturedProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [heroImages.length]);

  const goToSlide = (index) => {
    clearInterval(intervalRef.current);
    setCurrentSlide(index);

    // Restart auto slide
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
  };

  return (
    <>
      <Helmet>
        <title>FreshFish</title>
        <meta
          name="description"
          content="Experience the finest seafood, sustainably sourced and delivered fresh to your doorstep. Explore our premium fish, shellfish, and more."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[83vh] overflow-hidden">
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

        {/* Semi-transparent overlay - reduced opacity */}
        <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />

        {/* Content aligned to bottom */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
          <div className="text-white z-10 w-full">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Fresh Fish Delivered to Your Door
            </h1>
            <p className="text-lg md:text-xl mb-6 text-white leading-relaxed max-w-2xl">
              Experience the finest seafood, sustainably sourced and delivered
              fresh to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block text-center"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators - positioned above content */}
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
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
      </section>

      {/* Featured Products Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-normal text-gray-700  mb-4">
              Featured Products
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <img
                      src={
                        product.images ||
                        "/placeholder.png?height=250&width=300"
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <FaStar className="mr-1" />
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        KES {product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category?.name}
                      </span>
                    </div>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors block text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-4">
            <Link
              to="/shop"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-12">
            Special Offers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Weekend Seafood Feast Card */}
            <Link
              to="/shop?weekend=true"
              className="block relative rounded-2xl overflow-hidden shadow-xl group transform transition-transform duration-300 hover:scale-[1.02]"
            >
              <img
                src="https://res.cloudinary.com/djdalpfdh/image/upload/v1752399346/fish-ecommerce/products/l9pbsevlqi4h4chcqqv5.jpg"
                alt="Weekend Seafood Feast"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
              <div className="p-6 bg-white">
                <div className="flex items-center mb-3">
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    Weekend Special
                  </div>
                  <div className="ml-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    20% Off
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Weekend Seafood Feast
                </h3>
                <p className="text-gray-600 mb-6">
                  Enjoy 20% off on all seafood this weekend! Fresh catches
                  delivered to your door with extra savings.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">
                    Ends Monday 9 AM
                  </span>
                </div>
              </div>
            </Link>

            {/* Sustainable Seafood Selection Card */}
            <Link
              to="/shop?sustainable=true" // Changed to 'sustainable=true'
              className="block relative rounded-2xl overflow-hidden shadow-xl group transform transition-transform duration-300 hover:scale-[1.02]"
            >
              <img
                src="https://res.cloudinary.com/djdalpfdh/image/upload/v1752399452/fish-ecommerce/products/visfoab0gtre5tfgxklv.jpg"
                alt="Sustainable Seafood Selection"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
              <div className="p-6 bg-white">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Eco-Friendly
                  </div>
                  <div className="ml-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Sustainable
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Sustainable Seafood Selection
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore our eco-friendly and responsibly sourced seafood.
                  Every purchase supports sustainable fishing practices.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">
                    Always Available
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose Fresh Fish with us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to bringing you the freshest, highest quality
              seafood with unmatched service and sustainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Fresh Fish</h3>
              <p className="text-gray-600 leading-relaxed">
                Caught daily and delivered within 24 hours to ensure maximum
                freshness and quality.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">♻️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">
                Sustainably Sourced
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We partner with responsible fishermen who use sustainable
                practices to protect our oceans.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Same-day delivery available in most areas with
                temperature-controlled transport.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

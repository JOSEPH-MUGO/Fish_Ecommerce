/// File: client/src/components/Footer.js
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaFacebook, FaInstagram, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFish } from "react-icons/fa"
import axios from "axios"

const Footer = () => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/categories`)
      setCategories(response.data.slice(0, 4)) // Show only first 4 categories
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const quickLinks = [
    { name: "About", path: "/" },
    { name: "Contact", path: "/contact" },
    { name: "Catalog", path: "/shop" },
    { name: "Track order", path: "/orders" },
  ]

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
    { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
    { icon: FaWhatsapp, href: "https://wa.me/1234567890", label: "WhatsApp" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaFish className="text-2xl text-blue-400" />
              <span className="text-xl font-bold">FreshFish</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted source for the freshest fish and seafood. We deliver quality ocean products straight to your
              doorstep.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/shop?category=${category.id}`}
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">123 Tom mboya Street, Nairobi City</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+254 0212345678</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@freshfish.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} FreshCatch. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <Link to="/shop" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Catalog
              </Link>
              <Link to="/orders" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

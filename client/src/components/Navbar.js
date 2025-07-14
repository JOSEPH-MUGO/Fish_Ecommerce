// File: client/src/components/Navbar.js
"use client"
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaFish } from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { getCartItemsCount, toggleCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate("/")
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/shop", label: "Shop" },
    { path: "/contact", label: "Contact" },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaFish className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-gray-800">FreshFish</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors duration-200 ${
                  isActive(link.path) ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button onClick={toggleCart} className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <FaShoppingCart className="h-6 w-6" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <FaUser className="h-5 w-5" />
                  <span className="hidden md:block">{user?.firstName}</span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium transition-colors duration-200 ${
                    isActive(link.path) ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated() && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn btn-primary text-center">
                    Register
                  </Link>
                </>
              )}

              {isAuthenticated() && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    My Orders
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
